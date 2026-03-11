export interface NetworkRequest {
  url: string;
  resourceType: string;
  size: number;
  duration: number;
  blocked: boolean;
  fromCache: boolean;
  headers: Record<string, string>;
}

export interface HeadScript {
  src: string;
  async: boolean;
  defer: boolean;
}

export interface PageLoadResult {
  pageUrl: string;
  requests: NetworkRequest[];
  headScripts: HeadScript[];
  loadTime: number;
  domContentLoaded: number;
}
