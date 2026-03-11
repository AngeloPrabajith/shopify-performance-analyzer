import type { AnalysisRule } from '../../types/rules.js';

function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('/').pop() || url;
  } catch {
    // Handle relative URLs or malformed ones
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
