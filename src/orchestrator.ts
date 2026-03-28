import type { AnalysisResult } from './types/analysis.js';
import type { DetectedApp } from './types/detection.js';
import type { ScoreBreakdown } from './types/scoring.js';
import type { PageLoadResult, NetworkRequest } from './types/index.js';
import { scrapePage } from './scraper/index.js';
import { runRules, getDefaultRules } from './analyzer/index.js';
import { detectApps, loadFingerprints } from './detectors/index.js';
import { calculateScore } from './scoring/index.js';

export interface AnalyzeOptions {
  timeout?: number;
}

export type PageType = 'homepage' | 'product' | 'collection';

export interface ScannedPage {
  pageType: PageType;
  result: AnalysisResult;
  score: ScoreBreakdown;
}

export interface WaterfallEntry {
  url: string;
  resourceType: string;
  size: number;
  duration: number;
  startTime: number;
}

export interface AnalyzeOutput {
  result: AnalysisResult;
  apps: DetectedApp[];
  score: ScoreBreakdown;
  waterfall: WaterfallEntry[];
  pages?: ScannedPage[];
  missingPageTypes?: PageType[];
}

function toWaterfall(requests: NetworkRequest[]): WaterfallEntry[] {
  return requests.map((r) => ({
    url: r.url,
    resourceType: r.resourceType,
    size: r.size,
    duration: r.duration,
    startTime: r.startTime,
  }));
}

function analyzePage(url: string, pageData: PageLoadResult): { result: AnalysisResult; score: ScoreBreakdown; apps: DetectedApp[] } {
  const rules = getDefaultRules();
  const issues = runRules(pageData, rules);
  const fingerprints = loadFingerprints();
  const apps = detectApps(pageData.requests, fingerprints);
  const score = calculateScore(issues, apps);
  const totalTransferSize = pageData.requests.reduce((sum, r) => sum + r.size, 0);

  return {
    result: {
      issues,
      metadata: {
        url,
        loadTime: pageData.loadTime,
        totalRequests: pageData.requests.length,
        totalTransferSize,
        ttfb: pageData.ttfb,
        fcp: pageData.fcp,
        lcp: pageData.lcp,
        cls: pageData.cls,
      },
    },
    score,
    apps,
  };
}

/** Scan a single URL and return it as a ScannedPage (for adding pages after initial scan). */
export async function analyzeSinglePage(
  url: string,
  pageType: PageType,
  options: AnalyzeOptions = {},
): Promise<ScannedPage> {
  const pageData = await scrapePage(url, { timeout: options.timeout });
  const { result, score } = analyzePage(url, pageData);
  return { pageType, result, score };
}

export async function analyze(
  url: string,
  options: AnalyzeOptions = {},
): Promise<AnalyzeOutput> {
  const pageData = await scrapePage(url, { timeout: options.timeout });
  const { result, score, apps } = analyzePage(url, pageData);
  return { result, apps, score, waterfall: toWaterfall(pageData.requests) };
}

export async function analyzeMultiPage(
  url: string,
  options: AnalyzeOptions = {},
): Promise<AnalyzeOutput> {
  const timeout = options.timeout ?? 45_000;

  // Scrape homepage first - it also discovers product/collection links
  const homeData = await scrapePage(url, { timeout });
  const home = analyzePage(url, homeData);

  const pages: ScannedPage[] = [
    { pageType: 'homepage', result: home.result, score: home.score },
  ];

  // Collect all page data for combined app detection
  const allPageData: PageLoadResult[] = [homeData];

  const { product: productUrl, collection: collectionUrl } = homeData.linkedPages;

  // If no collection link found via DOM scan, fall back to /collections/all
  // which is a standard Shopify route present on virtually every store
  const resolvedCollectionUrl = collectionUrl ?? (() => {
    try {
      const origin = new URL(homeData.pageUrl).origin;
      return `${origin}/collections/all`;
    } catch {
      return null;
    }
  })();

  const candidates: { pageType: PageType; url: string }[] = [];
  if (productUrl) candidates.push({ pageType: 'product', url: productUrl });
  if (resolvedCollectionUrl) candidates.push({ pageType: 'collection', url: resolvedCollectionUrl });

  const missingPageTypes: PageType[] = [];
  if (!productUrl) missingPageTypes.push('product');

  for (const { pageType, url: pageUrl } of candidates) {
    try {
      const pageData = await scrapePage(pageUrl, { timeout });
      allPageData.push(pageData);
      const { result, score } = analyzePage(pageUrl, pageData);
      pages.push({ pageType, result, score });
    } catch {
      // Skip pages that fail - don't break the whole scan
    }
  }

  // Detect apps from all pages combined (more complete picture)
  const fingerprints = loadFingerprints();
  const combinedRequests = allPageData.flatMap((pd) => pd.requests);
  const combinedApps = detectApps(combinedRequests, fingerprints);

  return {
    result: home.result,
    apps: combinedApps,
    score: home.score,
    waterfall: toWaterfall(homeData.requests),
    pages,
    missingPageTypes: missingPageTypes.length > 0 ? missingPageTypes : undefined,
  };
}
