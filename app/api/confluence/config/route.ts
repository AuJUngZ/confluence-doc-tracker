import { NextResponse } from "next/server";

export async function GET() {
  try {
    const domain = process.env.CONFLUENCE_DOMAIN;
    const email = process.env.CONFLUENCE_EMAIL;
    const apiToken = process.env.CONFLUENCE_API_TOKEN;
    const userEmail = process.env.CONFLUENCE_USER_EMAIL;

    // Check if required env variables are set
    if (!domain || !email || !apiToken) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          configured: false,
        },
        { status: 500 }
      );
    }

    // Try to get user display name
    let userDisplayName: string | undefined;

    try {
      const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
      const userResponse = await fetch(
        `https://${domain}/wiki/rest/api/user/current`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json",
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        userDisplayName = userData.displayName || userData.publicName;
      }
    } catch (error) {
      console.error("Failed to fetch user display name:", error);
    }

    return NextResponse.json({
      configured: true,
      confluenceDomain: domain,
      userEmail: userEmail || email,
      userDisplayName,
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        configured: false,
      },
      { status: 500 }
    );
  }
}
