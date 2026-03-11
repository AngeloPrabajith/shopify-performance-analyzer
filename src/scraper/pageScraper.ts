import { chromium, type Response } from 'playwright';
import type { PageLoadResult, HeadScript } from '../types/index.js';
import { mapResponseToRequest } from './requestMapper.js';

const NAV_TIMEOUT = 30000;

export async function scrapePage(url: string): Promise<PageLoadResult> {
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
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: NAV_TIMEOUT,
    });

    // Gather performance timing from the browser
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: Math.round(perf.loadEventEnd - perf.startTime),
        domContentLoaded: Math.round(
          perf.domContentLoadedEventEnd - perf.startTime,
        ),
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

    // Map all captured responses to our NetworkRequest format
    const requests = await Promise.all(
      responses.map((r) => mapResponseToRequest(r).catch(() => null)),
    );

    return {
      pageUrl: url,
      requests: requests.filter((r) => r !== null),
      headScripts,
      loadTime: timing.loadTime,
      domContentLoaded: timing.domContentLoaded,
    };
  } finally {
    await browser.close();
  }
}
