import { NextRequest, NextResponse } from "next/server";
import type {
  SearchRequest,
  SearchResponse,
  ConfluenceSearchResult,
  DocumentContribution,
} from "@/types/confluence";

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { startDate, endDate } = body;

    // Get environment variables
    const domain = process.env.CONFLUENCE_DOMAIN;
    const email = process.env.CONFLUENCE_EMAIL;
    const apiToken = process.env.CONFLUENCE_API_TOKEN;
    const userEmail = process.env.CONFLUENCE_USER_EMAIL || email; // Use configured user email, fallback to auth email

    if (!domain || !email || !apiToken) {
      return NextResponse.json(
        {
          error:
            "Confluence configuration is missing. Please check your .env file.",
        },
        { status: 500 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "CONFLUENCE_USER_EMAIL is not configured in .env file." },
        { status: 500 }
      );
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

    console.log("🔍 Searching for user:", userEmail);

    // Use the configured user email instead of user input
    const identity = userEmail;

    // Step 1: MUST find user's account ID first to search accurately
    let userAccountId: string | null = null;
    let userDisplayName: string | null = null;

    // Method 1: Use Confluence REST API v2 to search for user by email
    console.log("Attempting to find user account ID...");

    // Try getting current user first (if identity matches authenticated user)
    const currentUserUrl = `https://${domain}/wiki/rest/api/user/current`;
    try {
      const currentUserResponse = await fetch(currentUserUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      });

      if (currentUserResponse.ok) {
        const currentUser = await currentUserResponse.json();
        console.log(
          "Current authenticated user:",
          currentUser.displayName,
          currentUser.email
        );

        if (
          currentUser.email?.toLowerCase() === identity.toLowerCase() ||
          currentUser.displayName
            ?.toLowerCase()
            .includes(identity.toLowerCase())
        ) {
          userAccountId = currentUser.accountId;
          userDisplayName = currentUser.displayName;
          console.log("✓ Using current user's account ID:", userAccountId);
        }
      }
    } catch (err) {
      console.log("Could not get current user");
    }

    // Method 2: Search all users in a space or use people search
    if (!userAccountId) {
      // Try people search API (works better for finding users by email)
      const peopleSearchUrl = `https://${domain}/wiki/rest/api/search?cql=type=user&limit=1000`;
      try {
        console.log("Searching through all users...");
        const searchResponse = await fetch(peopleSearchUrl, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log(
            `Found ${searchData.results?.length || 0} users in workspace`
          );

          if (searchData.results && searchData.results.length > 0) {
            for (const result of searchData.results) {
              const user = result.user;
              if (user) {
                const emailMatch =
                  user.email?.toLowerCase() === identity.toLowerCase();
                const displayMatch = user.displayName
                  ?.toLowerCase()
                  .includes(identity.toLowerCase());
                const publicMatch = user.publicName
                  ?.toLowerCase()
                  .includes(identity.toLowerCase());

                if (emailMatch || displayMatch || publicMatch) {
                  userAccountId = user.accountId;
                  userDisplayName = user.displayName;
                  console.log("✓ Found user account ID:", userAccountId);
                  console.log("  Display name:", userDisplayName);
                  console.log("  Email:", user.email);
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        console.log("Error searching users:", err);
      }
    }

    // If still no account ID found, return error
    if (!userAccountId) {
      console.error("❌ Could not find user account ID for:", identity);
      return NextResponse.json(
        {
          error: `Could not find user account ID for "${identity}". Please make sure the email or name is correct.`,
          suggestion:
            "Try using your full name or exact email address from Confluence profile.",
        },
        { status: 404 }
      );
    }

    console.log(
      "✅ Successfully found user:",
      userDisplayName,
      "Account ID:",
      userAccountId
    );

    // Build CQL query using the account ID
    let cqlQuery = `(creator = "${userAccountId}" OR contributor = "${userAccountId}") AND type = page`;

    if (startDate || endDate) {
      if (startDate && endDate) {
        cqlQuery += ` AND lastModified >= ${startDate} AND lastModified <= ${endDate}`;
      } else if (startDate) {
        cqlQuery += ` AND lastModified >= ${startDate}`;
      } else if (endDate) {
        cqlQuery += ` AND lastModified <= ${endDate}`;
      }
    }

    // Order by lastModified to get recent pages first
    cqlQuery += ` ORDER BY lastModified DESC`;

    console.log("📋 CQL Query:", cqlQuery);

    // Fetch pages from Confluence
    const uniquePages = new Map<string, DocumentContribution>();
    let start = 0;
    const limit = 100; // Increase limit since we have exact query
    let hasMore = true;
    let totalFetched = 0;

    while (hasMore) {
      const searchUrl = `https://${domain}/wiki/rest/api/content/search?cql=${encodeURIComponent(
        cqlQuery
      )}&start=${start}&limit=${limit}&expand=version,space,ancestors`;

      console.log(`Fetching pages: start=${start}, limit=${limit}`);

      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Confluence API error:", errorText);
        return NextResponse.json(
          {
            error: `Confluence API error: ${response.status} ${response.statusText}`,
            details: errorText,
          },
          { status: response.status }
        );
      }

      const data: ConfluenceSearchResult = await response.json();
      console.log(`Fetched ${data.results.length} pages`);

      // Process results - Since we used account ID in CQL, all results are relevant
      for (const page of data.results) {
        // Debug: Log first few pages
        if (uniquePages.size < 5) {
          console.log(`\n📄 Found: "${page.title}"`);
          console.log(`  Last modified: ${page.version.when}`);
          console.log(`  By: ${page.version.by.displayName}`);
          console.log(`  Space: ${(page as any).space?.name}`);
          console.log(
            `  Ancestors: ${(page as any).ancestors?.length || 0} levels`
          );
        }

        // Since we used account ID in CQL query, all results are valid
        if (!uniquePages.has(page.id)) {
          const pageWithExtras = page as any;

          uniquePages.set(page.id, {
            id: page.id,
            title: page.title,
            url: `https://${domain}/wiki${page._links.webui}`,
            lastModified: page.version.when,
            modifiedBy: page.version.by.displayName,
            version: page.version.number,
            space: pageWithExtras.space
              ? {
                  key: pageWithExtras.space.key,
                  name: pageWithExtras.space.name,
                }
              : undefined,
            ancestors:
              pageWithExtras.ancestors?.map((ancestor: any) => ({
                id: ancestor.id,
                title: ancestor.title,
              })) || [],
          });
        }
      }

      totalFetched += data.results.length;

      // Check if there are more results
      if (data.results.length < limit) {
        hasMore = false;
      } else {
        start += limit;
      }
    }

    // Convert map to array
    const documentsArray = Array.from(uniquePages.values());

    // Sort by last modified date (newest first)
    documentsArray.sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    console.log(`Found ${documentsArray.length} documents for ${identity}`);

    const response: SearchResponse = {
      documents: documentsArray,
      totalCount: documentsArray.length,
      searchedUser: identity,
      userDisplayName: userDisplayName || undefined,
      confluenceDomain: domain,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching Confluence data:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
