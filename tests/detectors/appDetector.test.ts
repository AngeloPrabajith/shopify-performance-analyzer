import { describe, it, expect } from 'vitest';
import { detectApps } from '../../src/detectors/appDetector.js';
import { createMockNetworkRequest } from '../helpers/fixtures.js';
import type { AppFingerprint } from '../../src/types/detection.js';

const testFingerprints: AppFingerprint[] = [
  {
    appName: 'Klaviyo',
    vendor: 'Klaviyo',
    domains: ['static.klaviyo.com', 'a.klaviyo.com'],
  },
  {
    appName: 'Hotjar',
    vendor: 'Hotjar',
    domains: ['static.hotjar.com'],
  },
  {
    appName: 'Judge.me',
    vendor: 'Judge.me',
    domains: ['cache.judge.me'],
  },
];

describe('detectApps', () => {
  it('detects an app from a matching domain', () => {
    const requests = [
      createMockNetworkRequest({
        url: 'https://static.klaviyo.com/onsite/js/klaviyo.js',
        size: 95000,
      }),
    ];

    const apps = detectApps(requests, testFingerprints);
    expect(apps).toHaveLength(1);
    expect(apps[0].appName).toBe('Klaviyo');
    expect(apps[0].scriptCount).toBe(1);
    expect(apps[0].totalSize).toBe(95000);
  });

  it('detects multiple apps from mixed requests', () => {
    const requests = [
      createMockNetworkRequest({
        url: 'https://static.klaviyo.com/onsite/js/klaviyo.js',
        size: 90000,
      }),
      createMockNetworkRequest({
        url: 'https://static.hotjar.com/c/hotjar-12345.js',
        size: 40000,
      }),
      createMockNetworkRequest({
        url: 'https://cdn.shopify.com/theme.js',
        size: 20000,
      }),
    ];

    const apps = detectApps(requests, testFingerprints);
    expect(apps).toHaveLength(2);
    expect(apps.map((a) => a.appName)).toContain('Klaviyo');
    expect(apps.map((a) => a.appName)).toContain('Hotjar');
  });

  it('counts multiple requests from the same app', () => {
    const requests = [
      createMockNetworkRequest({
        url: 'https://static.klaviyo.com/js/one.js',
        size: 50000,
      }),
      createMockNetworkRequest({
        url: 'https://a.klaviyo.com/api/track',
        size: 2000,
      }),
    ];

    const apps = detectApps(requests, testFingerprints);
    expect(apps).toHaveLength(1);
    expect(apps[0].scriptCount).toBe(2);
    expect(apps[0].totalSize).toBe(52000);
  });

  it('sorts results by total size descending', () => {
    const requests = [
      createMockNetworkRequest({
        url: 'https://static.hotjar.com/hotjar.js',
        size: 200000,
      }),
      createMockNetworkRequest({
        url: 'https://static.klaviyo.com/klaviyo.js',
        size: 50000,
      }),
    ];

    const apps = detectApps(requests, testFingerprints);
    expect(apps[0].appName).toBe('Hotjar');
    expect(apps[1].appName).toBe('Klaviyo');
  });

  it('returns empty array when no apps are detected', () => {
    const requests = [
      createMockNetworkRequest({
        url: 'https://cdn.shopify.com/theme.js',
        size: 30000,
      }),
    ];

    const apps = detectApps(requests, testFingerprints);
    expect(apps).toHaveLength(0);
  });

  it('matches subdomains of fingerprint domains', () => {
    const requests = [
      createMockNetworkRequest({
        url: 'https://sub.cache.judge.me/widget.js',
        size: 25000,
      }),
    ];

    const apps = detectApps(requests, testFingerprints);
    expect(apps).toHaveLength(1);
    expect(apps[0].appName).toBe('Judge.me');
  });
});
