export interface NetworkRequest {
  url: string;
  resourceType: string;
  size: number;
  duration: number;
  startTime: number;
  blocked: boolean;
  fromCache: boolean;
  headers: Record<string, string>;
}

export interface HeadScript {
  src: string;
  async: boolean;
  defer: boolean;
}

export interface ResourceHint {
  rel: string;
  href: string;
}

export interface PageLoadResult {
  pageUrl: string;
  requests: NetworkRequest[];
  headScripts: HeadScript[];
  resourceHints: ResourceHint[];
  loadTime: number;
  domContentLoaded: number;
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  linkedPages: { product: string | null; collection: string | null };
}
