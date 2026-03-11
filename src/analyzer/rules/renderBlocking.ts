import type { AnalysisRule } from '../../types/rules.js';

function extractFilename(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments.pop() || '';
    if (last.includes('.')) return last;
    if (last.length > 2) return `${parsed.hostname}/${last}`;
    return parsed.hostname + parsed.pathname;
  } catch {
    // Handle relative URLs
    return url.split('/').pop() || url;
  }
}

export const renderBlockingRule: AnalysisRule = {
  id: 'render-blocking',
  name: 'Render-Blocking Script Detection',

  evaluate(data) {
    if (!data.headScripts || data.headScripts.length === 0) {
      return [];
    }

    return data.headScripts
      .filter((script) => !script.async && !script.defer)
      .map((script) => ({
        ruleId: 'render-blocking',
        severity: 'warning' as const,
        title: `Render-blocking script: ${extractFilename(script.src)}`,
        description: `${extractFilename(script.src)} is loaded in <head> without async or defer, blocking page rendering.`,
        resourceUrl: script.src,
      }));
  },
};
