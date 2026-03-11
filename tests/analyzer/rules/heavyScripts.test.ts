import { describe, it, expect } from 'vitest';
import { heavyScriptsRule } from '../../../src/analyzer/rules/heavyScripts.js';
import {
  createMockPageLoadResult,
  createMockNetworkRequest,
} from '../../helpers/fixtures.js';

describe('heavyScriptsRule', () => {
  it('flags scripts larger than 100kb', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/heavy.js',
          size: 150000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = heavyScriptsRule.evaluate(data);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].title).toContain('heavy.js');
    expect(issues[0].savingsKb).toBeGreaterThan(0);
  });

  it('ignores scripts under the threshold', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({ size: 50000, resourceType: 'script' }),
      ],
    });

    const issues = heavyScriptsRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('ignores non-script resources even if large', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          size: 500000,
          resourceType: 'image',
        }),
      ],
    });

    const issues = heavyScriptsRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('flags multiple heavy scripts independently', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({ url: 'https://a.com/big1.js', size: 200000, resourceType: 'script' }),
        createMockNetworkRequest({ url: 'https://b.com/big2.js', size: 300000, resourceType: 'script' }),
        createMockNetworkRequest({ url: 'https://c.com/small.js', size: 5000, resourceType: 'script' }),
      ],
    });

    const issues = heavyScriptsRule.evaluate(data);
    expect(issues).toHaveLength(2);
  });
});
