import type { AnalysisRule } from '../../types/rules.js';

const SIZE_THRESHOLD = 102400; // 100kb

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

export const heavyScriptsRule: AnalysisRule = {
  id: 'heavy-scripts',
  name: 'Heavy Script Detection',

  evaluate(data) {
    return data.requests
      .filter((r) => r.resourceType === 'script' && r.size > SIZE_THRESHOLD)
      .map((r) => ({
        ruleId: 'heavy-scripts',
        severity: 'warning' as const,
        title: `Heavy script: ${extractFilename(r.url)} (${formatKb(r.size)})`,
        description: `${extractFilename(r.url)} is ${formatKb(r.size)}, exceeding the ${formatKb(SIZE_THRESHOLD)} threshold. Consider code splitting or lazy loading.`,
        resourceUrl: r.url,
        savingsKb: Math.round((r.size - SIZE_THRESHOLD) / 1024),
      }));
  },
};
