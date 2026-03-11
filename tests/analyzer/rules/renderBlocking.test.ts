import { describe, it, expect } from 'vitest';
import { renderBlockingRule } from '../../../src/analyzer/rules/renderBlocking.js';
import {
  createMockPageLoadResult,
  createMockHeadScript,
} from '../../helpers/fixtures.js';

describe('renderBlockingRule', () => {
  it('flags scripts in head without async or defer', () => {
    const data = createMockPageLoadResult({
      headScripts: [
        createMockHeadScript({
          src: 'https://cdn.example.com/blocking.js',
          async: false,
          defer: false,
        }),
      ],
    });

    const issues = renderBlockingRule.evaluate(data);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].title).toContain('blocking.js');
  });

  it('does not flag scripts with async attribute', () => {
    const data = createMockPageLoadResult({
      headScripts: [createMockHeadScript({ async: true })],
    });

    const issues = renderBlockingRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('does not flag scripts with defer attribute', () => {
    const data = createMockPageLoadResult({
      headScripts: [createMockHeadScript({ defer: true })],
    });

    const issues = renderBlockingRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('handles pages with no head scripts', () => {
    const data = createMockPageLoadResult({ headScripts: [] });
    const issues = renderBlockingRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('flags multiple blocking scripts independently', () => {
    const data = createMockPageLoadResult({
      headScripts: [
        createMockHeadScript({ src: 'https://a.com/one.js' }),
        createMockHeadScript({ src: 'https://b.com/two.js' }),
        createMockHeadScript({ src: 'https://c.com/ok.js', async: true }),
      ],
    });

    const issues = renderBlockingRule.evaluate(data);
    expect(issues).toHaveLength(2);
  });
});
