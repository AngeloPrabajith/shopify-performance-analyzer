import { chromium, type Response, errors as playwrightErrors } from 'playwright';
import type { PageLoadResult, HeadScript, ResourceHint } from '../types/index.js';
import { mapResponseToRequest } from './requestMapper.js';
import { ScraperError } from '../utils/errors.js';

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 1;

export interface ScrapeOptions {
  timeout?: number;
}

async function isPasswordProtected(page: { url: () => string; title: () => Promise<string> }): Promise<boolean> {
  const url = page.url();
  const title = await page.title();

  // Shopify password pages have a recognizable URL pattern and title
  if (url.includes('/password')) return true;
  if (title.toLowerCase().includes('opening soon')) return true;

  return false;
}

async function scrapeOnce(
  url: string,
  timeout: number,
): Promise<PageLoadResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const responses: Response[] = [];
  page.on('response', (response) => {
    responses.push(response);
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'load',
      timeout,
    });

    // Give extra time for lazy-loaded scripts and app resources to fire
    await page.waitForTimeout(3000);

    // Check for HTTP errors
    if (response && response.status() >= 400) {
      throw new ScraperError(
        `Server returned ${response.status()} for ${url}`,
        'HTTP_ERROR',
      );
    }

    // Check for Shopify password page
    if (await isPasswordProtected(page)) {
      throw new ScraperError(
        'This store is password-protected. Cannot analyze a locked storefront.',
        'PASSWORD_PROTECTED',
      );
    }

    // Gather performance timing from the browser
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;

      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        (e) => e.name === 'first-contentful-paint',
      );

      // LCP entries are buffered and accessible after page load
      const lcpEntries = performance.getEntriesByType(
        'largest-contentful-paint',
      );
      const lastLcp = lcpEntries[lcpEntries.length - 1] as
        | PerformanceEntry
        | undefined;

      // CLS: sum layout-shift entries that didn't have recent input
      const clsEntries = performance.getEntriesByType('layout-shift') as
        (PerformanceEntry & { hadRecentInput: boolean; value: number })[];
      const clsValue = clsEntries
        .filter((e) => !e.hadRecentInput)
        .reduce((sum, e) => sum + e.value, 0);

      // TTFB: time from navigation start to first byte of response
      const ttfb = perf.responseStart > 0
        ? Math.round(perf.responseStart - perf.startTime)
        : null;

      return {
        loadTime: Math.round(perf.loadEventEnd - perf.startTime),
        domContentLoaded: Math.round(
          perf.domContentLoadedEventEnd - perf.startTime,
        ),
        ttfb,
        fcp: fcpEntry ? Math.round(fcpEntry.startTime) : null,
        lcp: lastLcp ? Math.round(lastLcp.startTime) : null,
        cls: clsEntries.length > 0 ? Math.round(clsValue * 1000) / 1000 : null,
      };
    });

    // Collect script tags from <head> to check for render-blocking
    const headScripts: HeadScript[] = await page.evaluate(() => {
      const scripts = document.querySelectorAll('head script[src]');
      return Array.from(scripts).map((el) => ({
        src: el.getAttribute('src') || '',
        async: el.hasAttribute('async'),
        defer: el.hasAttribute('defer'),
      }));
    });

    // Collect resource hints (preload, prefetch, preconnect, dns-prefetch)
    const resourceHints: ResourceHint[] = await page.evaluate(() => {
      const hints = document.querySelectorAll(
        'link[rel="preload"], link[rel="prefetch"], link[rel="preconnect"], link[rel="dns-prefetch"]',
      );
      return Array.from(hints).map((el) => ({
        rel: el.getAttribute('rel') || '',
        href: el.getAttribute('href') || '',
      }));
    });

    // Discover Shopify product and collection links for multi-page scanning
    const linkedPages = await page.evaluate(() => {
      const origin = window.location.origin;
      const seen = { product: null as string | null, collection: null as string | null };
      const links = document.querySelectorAll('a[href]');
      for (const a of Array.from(links)) {
        const href = a.getAttribute('href') || '';
        const abs = href.startsWith('http') ? href : `${origin}${href}`;
        if (!seen.product && href.includes('/products/') && !href.includes('?') && !href.includes('#')) {
          seen.product = abs;
        }
        if (!seen.collection && href.includes('/collections/') && !href.includes('?') && !href.includes('#')) {
          seen.collection = abs;
        }
        if (seen.product && seen.collection) break;
      }
      return seen;
    });

    // Map all captured responses to our NetworkRequest format
    const requests = await Promise.all(
      responses.map((r) => mapResponseToRequest(r).catch(() => null)),
    );

    return {
      pageUrl: url,
      requests: requests.filter((r) => r !== null),
      headScripts,
      resourceHints,
      loadTime: timing.loadTime,
      domContentLoaded: timing.domContentLoaded,
      ttfb: timing.ttfb,
      fcp: timing.fcp,
      lcp: timing.lcp,
      cls: timing.cls,
      linkedPages,
    };
  } finally {
    await browser.close();
  }
}

export async function scrapePage(
  url: string,
  options: ScrapeOptions = {},
): Promise<PageLoadResult> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await scrapeOnce(url, timeout);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry for non-transient errors
      if (err instanceof ScraperError) throw err;

      // Timeout is worth retrying once
      if (err instanceof playwrightErrors.TimeoutError && attempt < MAX_RETRIES) {
        continue;
      }

      // DNS or connection failures
      if (lastError.message.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new ScraperError(
          `Could not resolve hostname. Check the URL and try again.`,
          'DNS_ERROR',
        );
      }

      if (lastError.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new ScraperError(
          `Connection refused by the server.`,
          'CONNECTION_ERROR',
        );
      }
    }
  }

  throw new ScraperError(
    `Failed to load ${url} after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
    'NAVIGATION_FAILED',
  );
}
