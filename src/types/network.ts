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

export interface AccessibilityData {
  htmlLang: string | null;
  totalImages: number;
  imagesWithoutAlt: number;
  missingAltUrls: string[];
  h1Count: number;
  headingLevels: number[];
  formsWithoutLabels: number;
  totalFormInputs: number;
  hasMainLandmark: boolean;
}

export interface SeoData {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
  h1Count: number;
  h1Text: string | null;
  hasStructuredData: boolean;
  structuredDataTypes: string[];
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
  accessibilityData?: AccessibilityData;
  seoData?: SeoData;
}
