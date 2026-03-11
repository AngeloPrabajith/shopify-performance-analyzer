import type { AnalysisRule } from '../../types/rules.js';

// Known libraries and patterns to match against script URLs
const LIBRARY_PATTERNS: Record<string, RegExp> = {
  jQuery: /jquery[.\-\/]/i,
  Lodash: /lodash[.\-\/]/i,
  Moment: /moment[.\-\/]/i,
  React: /react(?:\.production|\.development|[\-.]dom)[.\-\/]/i,
  Vue: /vue[.\-\/](?!tify)/i,
  Angular: /angular[.\-\/]/i,
  Swiper: /swiper[.\-\/]/i,
  GSAP: /gsap[.\-\/]/i,
  Slick: /slick[.\-\/]/i,
  Owl: /owl\.carousel[.\-\/]/i,
};

function stripQueryString(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export const duplicateLibrariesRule: AnalysisRule = {
  id: 'duplicate-libraries',
  name: 'Duplicate Library Detection',

  evaluate(data) {
    const scripts = data.requests.filter((r) => r.resourceType === 'script');

    // For each known library, find all distinct script URLs that match
    const matches: Record<string, Set<string>> = {};

    for (const [libName, pattern] of Object.entries(LIBRARY_PATTERNS)) {
      for (const script of scripts) {
        if (pattern.test(script.url)) {
          if (!matches[libName]) {
            matches[libName] = new Set();
          }
          matches[libName].add(stripQueryString(script.url));
        }
      }
    }

    // Only flag libraries loaded from 2+ distinct URLs
    return Object.entries(matches)
      .filter(([, urls]) => urls.size > 1)
      .map(([libName, urls]) => ({
        ruleId: 'duplicate-libraries',
        severity: 'critical' as const,
        title: `Duplicate library: ${libName} loaded ${urls.size} times`,
        description: `${libName} was found at ${urls.size} different URLs: ${[...urls].join(', ')}`,
      }));
  },
};
