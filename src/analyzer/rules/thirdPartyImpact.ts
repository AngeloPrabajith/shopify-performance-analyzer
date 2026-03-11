import type { AnalysisRule } from '../../types/rules.js';

const TOTAL_THIRD_PARTY_THRESHOLD = 512000; // 500kb total
const SINGLE_SCRIPT_THRESHOLD = 204800; // 200kb per script

// Shopify CDN domains that count as first-party for Shopify stores
const SHOPIFY_DOMAINS = new Set([
  'cdn.shopify.com',
  'cdn.shopifycdn.net',
  'monorail-edge.shopifysvc.com',
]);

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)}kb`;
}

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').pop() || url;
  } catch {
    return url;
  }
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function isFirstParty(scriptHostname: string, pageHostname: string): boolean {
  if (scriptHostname === pageHostname) return true;
  if (scriptHostname.endsWith(`.${pageHostname}`)) return true;

  // Shopify CDN counts as first-party
  if (SHOPIFY_DOMAINS.has(scriptHostname)) return true;

  return false;
}

export const thirdPartyImpactRule: AnalysisRule = {
  id: 'third-party-impact',
  name: 'Third-Party Script Impact',

  evaluate(data) {
    const pageHostname = getHostname(data.pageUrl);
    const scripts = data.requests.filter((r) => r.resourceType === 'script');

    const thirdParty = scripts.filter(
      (s) => !isFirstParty(getHostname(s.url), pageHostname),
    );

    if (thirdParty.length === 0) return [];

    const totalSize = thirdParty.reduce((sum, s) => sum + s.size, 0);
    const issues = [];

    // Summary info
    issues.push({
      ruleId: 'third-party-impact',
      severity: 'info' as const,
      title: `${thirdParty.length} third-party scripts (${formatKb(totalSize)} total)`,
      description: `Found ${thirdParty.length} scripts from external domains totaling ${formatKb(totalSize)}.`,
    });

    // Total weight exceeds threshold
    if (totalSize > TOTAL_THIRD_PARTY_THRESHOLD) {
      issues.push({
        ruleId: 'third-party-impact',
        severity: 'critical' as const,
        title: `Third-party scripts total ${formatKb(totalSize)}`,
        description: `Combined third-party script weight of ${formatKb(totalSize)} exceeds the ${formatKb(TOTAL_THIRD_PARTY_THRESHOLD)} threshold.`,
        savingsKb: Math.round((totalSize - TOTAL_THIRD_PARTY_THRESHOLD) / 1024),
      });
    }

    // Individual heavy scripts
    for (const script of thirdParty) {
      if (script.size > SINGLE_SCRIPT_THRESHOLD) {
        issues.push({
          ruleId: 'third-party-impact',
          severity: 'warning' as const,
          title: `Heavy third-party script: ${extractFilename(script.url)} (${formatKb(script.size)})`,
          description: `${extractFilename(script.url)} from ${getHostname(script.url)} is ${formatKb(script.size)}.`,
          resourceUrl: script.url,
          savingsKb: Math.round(
            (script.size - SINGLE_SCRIPT_THRESHOLD) / 1024,
          ),
        });
      }
    }

    return issues;
  },
};
