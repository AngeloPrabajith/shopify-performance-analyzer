import { describe, it, expect, vi } from 'vitest';
import { runRules } from '../../src/analyzer/ruleEngine.js';
import { createMockPageLoadResult } from '../helpers/fixtures.js';
import type { AnalysisRule } from '../../src/types/rules.js';
import type { AnalysisIssue } from '../../src/types/analysis.js';

function createMockRule(
  id: string,
  issues: AnalysisIssue[] = [],
): AnalysisRule {
  return {
    id,
    name: `Mock rule: ${id}`,
    evaluate: () => issues,
  };
}

function createFailingRule(id: string): AnalysisRule {
  return {
    id,
    name: `Failing rule: ${id}`,
    evaluate: () => {
      throw new Error('Something broke');
    },
  };
}

describe('runRules', () => {
  const pageData = createMockPageLoadResult();

  it('returns an empty array when no rules are provided', () => {
    const issues = runRules(pageData, []);
    expect(issues).toEqual([]);
  });

  it('collects issues from multiple rules', () => {
    const issueA: AnalysisIssue = {
      ruleId: 'rule-a',
      severity: 'warning',
      title: 'Issue A',
      description: 'First issue',
    };
    const issueB: AnalysisIssue = {
      ruleId: 'rule-b',
      severity: 'critical',
      title: 'Issue B',
      description: 'Second issue',
    };

    const rules = [
      createMockRule('rule-a', [issueA]),
      createMockRule('rule-b', [issueB]),
    ];

    const issues = runRules(pageData, rules);
    expect(issues).toHaveLength(2);
    expect(issues[0].ruleId).toBe('rule-a');
    expect(issues[1].ruleId).toBe('rule-b');
  });

  it('preserves issue ordering across rules', () => {
    const issues = [
      { ruleId: 'first', severity: 'info' as const, title: '1', description: '' },
      { ruleId: 'second', severity: 'info' as const, title: '2', description: '' },
    ];

    const rules = [
      createMockRule('first', [issues[0]]),
      createMockRule('second', [issues[1]]),
    ];

    const result = runRules(pageData, rules);
    expect(result[0].ruleId).toBe('first');
    expect(result[1].ruleId).toBe('second');
  });

  it('isolates rule failures without crashing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const validIssue: AnalysisIssue = {
      ruleId: 'valid',
      severity: 'warning',
      title: 'Valid issue',
      description: 'This should still appear',
    };

    const rules = [
      createFailingRule('broken'),
      createMockRule('valid', [validIssue]),
    ];

    const issues = runRules(pageData, rules);
    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('valid');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('broken'),
    );

    warnSpy.mockRestore();
  });

  it('returns empty array when all rules produce no issues', () => {
    const rules = [createMockRule('clean-a'), createMockRule('clean-b')];
    const issues = runRules(pageData, rules);
    expect(issues).toEqual([]);
  });
});
