export interface ConfluenceUser {
  accountId: string;
  accountType: string;
  email?: string;
  publicName: string;
  displayName: string;
}

export interface ConfluenceVersion {
  by: ConfluenceUser;
  when: string;
  message?: string;
  number: number;
}

export interface ConfluencePage {
  id: string;
  type: string;
  status: string;
  title: string;
  version: ConfluenceVersion;
  history?: {
    latest: boolean;
    createdBy: ConfluenceUser;
    createdDate: string;
    lastUpdated: {
      by: ConfluenceUser;
      when: string;
    };
  };
  _links: {
    webui: string;
    self: string;
  };
}

export interface ConfluenceSearchResult {
  results: ConfluencePage[];
  start: number;
  limit: number;
  size: number;
  _links: {
    base: string;
  };
}

export interface DocumentContribution {
  id: string;
  title: string;
  url: string;
  lastModified: string;
  modifiedBy: string;
  version: number;
  space?: {
    key: string;
    name: string;
  };
  ancestors?: {
    id: string;
    title: string;
  }[];
}

export interface SearchRequest {
  identity: string; // email or name
  startDate?: string;
  endDate?: string;
}

export interface SearchResponse {
  documents: DocumentContribution[];
  totalCount: number;
  searchedUser: string;
  userDisplayName?: string;
  confluenceDomain?: string;
}
