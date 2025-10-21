// Utility to get unique contributors from Confluence
export async function getUniqueContributors(
  domain: string,
  auth: string,
  startDate?: string,
  endDate?: string
): Promise<Set<string>> {
  const contributors = new Set<string>();

  let cqlQuery = `type = page`;
  if (startDate && endDate) {
    cqlQuery += ` AND lastModified >= ${startDate} AND lastModified <= ${endDate}`;
  }
  cqlQuery += ` ORDER BY lastModified DESC`;

  const searchUrl = `https://${domain}/wiki/rest/api/content/search?cql=${encodeURIComponent(
    cqlQuery
  )}&start=0&limit=50&expand=version,history,history.lastUpdated`;

  try {
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      for (const page of data.results) {
        if (page.version?.by?.email) {
          contributors.add(
            `${page.version.by.displayName} (${page.version.by.email})`
          );
        }
        if (page.history?.createdBy?.email) {
          contributors.add(
            `${page.history.createdBy.displayName} (${page.history.createdBy.email})`
          );
        }
        if (page.history?.lastUpdated?.by?.email) {
          contributors.add(
            `${page.history.lastUpdated.by.displayName} (${page.history.lastUpdated.by.email})`
          );
        }
      }
    }
  } catch (err) {
    console.error("Error fetching contributors:", err);
  }

  return contributors;
}
