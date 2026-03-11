import type { AnalysisRule } from '../../types/rules.js';

// Each pattern matches a specific library bundle. The regex uses word
// boundaries or path separators so related-but-different modules
// (e.g. swiper.js vs swiper-core.js) are not treated as the same lib.
const LIBRARY_PATTERNS: Record<string, RegExp> = {
  jQuery: /\/jquery(?:[.\-]\d|\.min\.js|\.js)/i,
  Lodash: /\/lodash(?:[.\-]\d|\.min\.js|\.js|\.core)/i,
  Moment: /\/moment(?:[.\-]\d|\.min\.js|\.js)/i,
  React: /\/react(?:\.production|\.development)(?:\.min)?\.js/i,
  'React DOM': /\/react-dom(?:\.production|\.development)/i,
  Vue: /\/vue(?:[.\-]\d|\.min\.js|\.global|\.esm)/i,
  Angular: /\/angular(?:[.\-]\d|\.min\.js)/i,
  Swiper: /\/swiper(?:[.\-]\d|\.min\.js|\.bundle)/i,
  GSAP: /\/gsap(?:[.\-]\d|\.min\.js)/i,
  Slick: /\/slick(?:[.\-]\d|\.min\.js)/i,
  'Owl Carousel': /\/owl\.carousel/i,
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
