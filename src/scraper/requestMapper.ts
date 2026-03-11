import type { Response } from 'playwright';
import type { NetworkRequest } from '../types/index.js';

/**
 * Extracts the byte size from a Playwright response. Tries content-length
 * header first, falls back to reading the body directly.
 */
async function extractSize(response: Response): Promise<number> {
  const contentLength = response.headers()['content-length'];
  if (contentLength) {
    const parsed = parseInt(contentLength, 10);
    if (!isNaN(parsed)) return parsed;
  }

  try {
    const body = await response.body();
    return body.length;
  } catch {
    return 0;
  }
}

export async function mapResponseToRequest(
  response: Response,
): Promise<NetworkRequest> {
  const request = response.request();
  const timing = response.request().timing();

  const size = await extractSize(response);
  const duration = timing.responseEnd > 0 ? timing.responseEnd - timing.startTime : 0;

  return {
    url: response.url(),
    resourceType: request.resourceType(),
    size,
    duration: Math.max(0, duration),
    blocked: false,
    fromCache: response.fromServiceWorker(),
    headers: response.headers(),
  };
}
