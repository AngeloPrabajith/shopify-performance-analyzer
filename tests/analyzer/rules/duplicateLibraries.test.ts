import { describe, it, expect } from 'vitest';
import { duplicateLibrariesRule } from '../../../src/analyzer/rules/duplicateLibraries.js';
import {
  createMockPageLoadResult,
  createMockNetworkRequest,
} from '../../helpers/fixtures.js';

describe('duplicateLibrariesRule', () => {
  it('detects duplicate jQuery loads from different URLs', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/vendor/jquery-3.6.0.min.js',
          resourceType: 'script',
        }),
        createMockNetworkRequest({
          url: 'https://cdn.other.com/libs/jquery-3.5.1.min.js',
          resourceType: 'script',
        }),
      ],
    });

    const issues = duplicateLibrariesRule.evaluate(data);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('critical');
    expect(issues[0].title).toContain('jQuery');
  });

  it('ignores a single load of a library', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/vendor/jquery-3.6.0.min.js',
          resourceType: 'script',
        }),
      ],
    });

    const issues = duplicateLibrariesRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('does not flag the same URL loaded twice (cache artifact)', () => {
    const url = 'https://cdn.example.com/vendor/jquery-3.6.0.min.js';
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({ url, resourceType: 'script' }),
        createMockNetworkRequest({ url, resourceType: 'script' }),
      ],
    });

    const issues = duplicateLibrariesRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('strips query strings when comparing URLs', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/vendor/jquery.min.js?v=1',
          resourceType: 'script',
        }),
        createMockNetworkRequest({
          url: 'https://cdn.example.com/vendor/jquery.min.js?v=2',
          resourceType: 'script',
        }),
      ],
    });

    // Same base URL, just different query params
    const issues = duplicateLibrariesRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('does not flag related but different modules as duplicates', () => {
    // swiper.js and swiper-core.js are different packages
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/assets/swiper-core.js',
          resourceType: 'script',
        }),
        createMockNetworkRequest({
          url: 'https://cdn.example.com/assets/swiper.js',
          resourceType: 'script',
        }),
      ],
    });

    const issues = duplicateLibrariesRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('returns no issues for an empty request list', () => {
    const data = createMockPageLoadResult({ requests: [] });
    const issues = duplicateLibrariesRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });
});
