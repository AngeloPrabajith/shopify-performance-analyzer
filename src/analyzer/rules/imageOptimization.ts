import type { AnalysisRule } from '../../types/rules.js';

const LARGE_IMAGE_THRESHOLD = 512000; // 500kb
const LEGACY_FORMATS = new Set(['image/png', 'image/bmp', 'image/tiff']);
const LEGACY_EXTENSIONS = new Set(['.png', '.bmp', '.tiff', '.tif']);

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)}kb`;
}

function extractFilename(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments.pop() || '';
    if (last.includes('.')) return last;
    if (last.length > 2) return `${parsed.hostname}/${last}`;
    return parsed.hostname + parsed.pathname;
  } catch {
    return url;
  }
}

function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const dot = pathname.lastIndexOf('.');
    return dot >= 0 ? pathname.slice(dot).toLowerCase() : '';
  } catch {
    return '';
  }
}

function getContentType(headers: Record<string, string>): string {
  return (headers['content-type'] || '').split(';')[0].trim().toLowerCase();
}

export const imageOptimizationRule: AnalysisRule = {
  id: 'image-optimization',
  name: 'Image Optimization',

  evaluate(data) {
    const images = data.requests.filter((r) => r.resourceType === 'image');
    const issues = [];

    for (const img of images) {
      const filename = extractFilename(img.url);

      // Flag oversized images
      if (img.size > LARGE_IMAGE_THRESHOLD) {
        issues.push({
          ruleId: 'image-optimization',
          severity: 'warning' as const,
          title: `Large image: ${filename} (${formatKb(img.size)})`,
          description: `${filename} is ${formatKb(img.size)}. Consider compressing or resizing to reduce page weight.`,
          resourceUrl: img.url,
          savingsKb: Math.round((img.size - LARGE_IMAGE_THRESHOLD) / 1024),
        });
      }

      // Flag legacy formats that could use WebP/AVIF
      const contentType = getContentType(img.headers);
      const ext = getExtension(img.url);
      if (LEGACY_FORMATS.has(contentType) || LEGACY_EXTENSIONS.has(ext)) {
        const estimatedSavings = Math.round((img.size * 0.3) / 1024);
        issues.push({
          ruleId: 'image-optimization',
          severity: 'info' as const,
          title: `Legacy format: ${filename}`,
          description: `${filename} uses a legacy image format. Converting to WebP or AVIF could save roughly ${estimatedSavings}kb.`,
          resourceUrl: img.url,
          savingsKb: estimatedSavings,
        });
      }
    }

    return issues;
  },
};
