import { describe, it, expect } from 'vitest';
import {
  createMockNetworkRequest,
  createMockHeadScript,
  createMockPageLoadResult,
} from './helpers/fixtures.js';

describe('type interfaces', () => {
  it('creates a valid NetworkRequest with defaults', () => {
    const req = createMockNetworkRequest();
    expect(req.url).toContain('cdn.shopify.com');
    expect(req.resourceType).toBe('script');
    expect(req.size).toBeGreaterThan(0);
  });

  it('creates a NetworkRequest with custom values', () => {
    const req = createMockNetworkRequest({
      url: 'https://example.com/app.js',
      size: 150000,
      resourceType: 'script',
    });
    expect(req.url).toBe('https://example.com/app.js');
    expect(req.size).toBe(150000);
  });

  it('creates a valid HeadScript with defaults', () => {
    const script = createMockHeadScript();
    expect(script.src).toBeTruthy();
    expect(script.async).toBe(false);
    expect(script.defer).toBe(false);
  });

  it('creates a valid PageLoadResult with defaults', () => {
    const result = createMockPageLoadResult();
    expect(result.pageUrl).toContain('myshopify.com');
    expect(result.requests).toEqual([]);
    expect(result.headScripts).toEqual([]);
    expect(result.loadTime).toBeGreaterThan(0);
  });

  it('creates a PageLoadResult with nested request data', () => {
    const result = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({ size: 50000 }),
        createMockNetworkRequest({ size: 120000 }),
      ],
    });
    expect(result.requests).toHaveLength(2);
    expect(result.requests[0].size).toBe(50000);
    expect(result.requests[1].size).toBe(120000);
  });
});
