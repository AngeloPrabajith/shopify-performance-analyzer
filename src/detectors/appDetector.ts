import type { NetworkRequest } from '../types/network.js';
import type { AppFingerprint, DetectedApp } from '../types/detection.js';

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function domainMatches(requestHost: string, fingerprintDomain: string): boolean {
  return (
    requestHost === fingerprintDomain ||
    requestHost.endsWith(`.${fingerprintDomain}`)
  );
}

export function detectApps(
  requests: NetworkRequest[],
  fingerprints: AppFingerprint[],
): DetectedApp[] {
  const detected: DetectedApp[] = [];

  for (const fp of fingerprints) {
    const matching = requests.filter((req) => {
      const host = getHostname(req.url);
      return fp.domains.some((domain) => domainMatches(host, domain));
    });

    if (matching.length === 0) continue;

    // Pick the first matched domain for reference
    const firstMatchHost = getHostname(matching[0].url);
    const matchedDomain =
      fp.domains.find((d) => domainMatches(firstMatchHost, d)) || fp.domains[0];

    detected.push({
      appName: fp.appName,
      vendor: fp.vendor,
      matchedDomain,
      scriptCount: matching.length,
      totalSize: matching.reduce((sum, r) => sum + r.size, 0),
    });
  }

  // Sort by total size descending so the heaviest apps appear first
  return detected.sort((a, b) => b.totalSize - a.totalSize);
}
