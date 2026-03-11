import { describe, it, expect, vi } from 'vitest';
import { mapResponseToRequest } from '../../src/scraper/requestMapper.js';

// Minimal mock that satisfies what mapResponseToRequest actually calls
function createMockResponse(overrides: {
  url?: string;
  resourceType?: string;
  contentLength?: string | null;
  body?: Buffer | null;
  fromServiceWorker?: boolean;
} = {}) {
  const headers: Record<string, string> = {};
  if (overrides.contentLength) {
    headers['content-length'] = overrides.contentLength;
  }

  return {
    url: () => overrides.url ?? 'https://cdn.shopify.com/scripts/app.js',
    headers: () => headers,
    body: overrides.body === null
      ? vi.fn().mockRejectedValue(new Error('No body'))
      : vi.fn().mockResolvedValue(overrides.body ?? Buffer.from('abc')),
    fromServiceWorker: () => overrides.fromServiceWorker ?? false,
    request: () => ({
      resourceType: () => overrides.resourceType ?? 'script',
      timing: () => ({ startTime: 0, responseEnd: 150 }),
    }),
  };
}

describe('mapResponseToRequest', () => {
  it('extracts url and resource type from the response', async () => {
    const mock = createMockResponse({
      url: 'https://example.com/main.js',
      resourceType: 'script',
    });

    const req = await mapResponseToRequest(mock as any);
    expect(req.url).toBe('https://example.com/main.js');
    expect(req.resourceType).toBe('script');
  });

  it('uses content-length header for size when available', async () => {
    const mock = createMockResponse({ contentLength: '98000' });

    const req = await mapResponseToRequest(mock as any);
    expect(req.size).toBe(98000);
  });

  it('falls back to body length when content-length is missing', async () => {
    const body = Buffer.alloc(5000);
    const mock = createMockResponse({ body });

    const req = await mapResponseToRequest(mock as any);
    expect(req.size).toBe(5000);
  });

  it('returns size 0 when both content-length and body fail', async () => {
    const mock = createMockResponse({
      contentLength: null,
      body: null,
    });

    const req = await mapResponseToRequest(mock as any);
    expect(req.size).toBe(0);
  });

  it('calculates duration from timing data', async () => {
    const mock = createMockResponse();

    const req = await mapResponseToRequest(mock as any);
    expect(req.duration).toBe(150);
  });

  it('detects service worker responses', async () => {
    const mock = createMockResponse({ fromServiceWorker: true });

    const req = await mapResponseToRequest(mock as any);
    expect(req.fromCache).toBe(true);
  });
});
