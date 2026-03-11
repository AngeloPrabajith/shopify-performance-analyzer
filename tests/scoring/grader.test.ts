import { describe, it, expect } from 'vitest';
import { getGrade } from '../../src/scoring/grader.js';

describe('getGrade', () => {
  it('returns A for scores 90-100', () => {
    expect(getGrade(100).grade).toBe('A');
    expect(getGrade(95).grade).toBe('A');
    expect(getGrade(90).grade).toBe('A');
    expect(getGrade(90).label).toBe('Excellent');
  });

  it('returns B for scores 70-89', () => {
    expect(getGrade(89).grade).toBe('B');
    expect(getGrade(75).grade).toBe('B');
    expect(getGrade(70).grade).toBe('B');
    expect(getGrade(70).label).toBe('Good');
  });

  it('returns C for scores 50-69', () => {
    expect(getGrade(69).grade).toBe('C');
    expect(getGrade(55).grade).toBe('C');
    expect(getGrade(50).grade).toBe('C');
    expect(getGrade(50).label).toBe('Needs Work');
  });

  it('returns D for scores below 50', () => {
    expect(getGrade(49).grade).toBe('D');
    expect(getGrade(25).grade).toBe('D');
    expect(getGrade(0).grade).toBe('D');
    expect(getGrade(0).label).toBe('Poor');
  });

  it('clamps out-of-range values', () => {
    expect(getGrade(150).grade).toBe('A');
    expect(getGrade(-10).grade).toBe('D');
  });
});
