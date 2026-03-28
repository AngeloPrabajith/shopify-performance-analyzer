import type { AnalysisRule } from '../../types/rules.js';

const SHOPIFY_DOMAINS = new Set([
  'cdn.shopify.com',
  'cdn.shopifycdn.net',
  'monorail-edge.shopifysvc.com',
]);

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export const resourceHintsRule: AnalysisRule = {
  id: 'resource-hints',
  name: 'Resource Hints',

  evaluate(data) {
    const issues = [];
    const pageHostname = getHostname(data.pageUrl);

    // Find third-party domains used by scripts
    const thirdPartyDomains = new Set<string>();
    for (const req of data.requests) {
      if (req.resourceType !== 'script') continue;
      const host = getHostname(req.url);
      if (
        host &&
        host !== pageHostname &&
        !host.endsWith(`.${pageHostname}`) &&
        !SHOPIFY_DOMAINS.has(host)
      ) {
        thirdPartyDomains.add(host);
      }
    }

    // Check which third-party domains have preconnect hints
    const preconnectHosts = new Set(
      data.resourceHints
        .filter((h) => h.rel === 'preconnect' || h.rel === 'dns-prefetch')
        .map((h) => getHostname(h.href))
        .filter(Boolean),
    );

    const missingPreconnect = [...thirdPartyDomains].filter(
      (d) => !preconnectHosts.has(d),
    );

    if (missingPreconnect.length > 0 && missingPreconnect.length <= 10) {
      for (const domain of missingPreconnect.slice(0, 5)) {
        issues.push({
          ruleId: 'resource-hints',
          severity: 'info' as const,
          title: `Missing preconnect for ${domain}`,
          description: `Adding <link rel="preconnect" href="https://${domain}"> can reduce connection time for third-party scripts.`,
        });
      }
    } else if (missingPreconnect.length > 10) {
      issues.push({
        ruleId: 'resource-hints',
        severity: 'warning' as const,
        title: `${missingPreconnect.length} third-party domains without preconnect`,
        description: `Many third-party domains lack preconnect hints. Prioritize preconnect for the heaviest: ${missingPreconnect.slice(0, 3).join(', ')}.`,
      });
    }

    // Check if any render-blocking scripts in <head> lack preload
    const preloadHrefs = new Set(
      data.resourceHints
        .filter((h) => h.rel === 'preload')
        .map((h) => h.href),
    );

    const blockingWithoutPreload = data.headScripts.filter(
      (s) => !s.async && !s.defer && s.src && !preloadHrefs.has(s.src),
    );

    if (blockingWithoutPreload.length > 0) {
      issues.push({
        ruleId: 'resource-hints',
        severity: 'info' as const,
        title: `${blockingWithoutPreload.length} render-blocking script(s) without preload`,
        description:
          'Render-blocking scripts in <head> can benefit from <link rel="preload"> to start downloading earlier.',
      });
    }

    return issues;
  },
};
