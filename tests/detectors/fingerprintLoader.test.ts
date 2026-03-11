import { describe, it, expect } from 'vitest';
import { loadFingerprints } from '../../src/detectors/fingerprintLoader.js';

describe('loadFingerprints', () => {
  it('loads and parses the fingerprint JSON file', () => {
    const fingerprints = loadFingerprints();
    expect(fingerprints.length).toBeGreaterThan(0);
  });

  it('each fingerprint has required fields', () => {
    const fingerprints = loadFingerprints();

    for (const fp of fingerprints) {
      expect(fp.appName).toBeTruthy();
      expect(fp.vendor).toBeTruthy();
      expect(fp.domains).toBeInstanceOf(Array);
      expect(fp.domains.length).toBeGreaterThan(0);
    }
  });

  it('includes well-known Shopify ecosystem apps', () => {
    const fingerprints = loadFingerprints();
    const names = fingerprints.map((fp) => fp.appName);

    expect(names).toContain('Klaviyo');
    expect(names).toContain('Google Analytics');
    expect(names).toContain('ReCharge');
  });
});
