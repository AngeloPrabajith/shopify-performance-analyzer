import type { NetworkRequest, HeadScript, PageLoadResult } from '../../src/types/index.js';

export function createMockNetworkRequest(
  overrides: Partial<NetworkRequest> = {},
): NetworkRequest {
  return {
    url: 'https://cdn.shopify.com/s/files/scripts/main.js',
    resourceType: 'script',
    size: 45000,
    duration: 120,
    blocked: false,
    fromCache: false,
    headers: {},
    ...overrides,
  };
}

export function createMockHeadScript(
  overrides: Partial<HeadScript> = {},
): HeadScript {
  return {
    src: 'https://cdn.shopify.com/s/files/scripts/main.js',
    async: false,
    defer: false,
    ...overrides,
  };
}

export function createMockPageLoadResult(
  overrides: Partial<PageLoadResult> = {},
): PageLoadResult {
  return {
    pageUrl: 'https://test-store.myshopify.com',
    requests: [],
    headScripts: [],
    loadTime: 2400,
    domContentLoaded: 1800,
    ...overrides,
  };
}
