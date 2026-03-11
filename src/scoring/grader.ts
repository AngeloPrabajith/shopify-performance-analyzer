import type { Grade } from '../types/scoring.js';

const GRADE_THRESHOLDS: { min: number; grade: string; label: string; color: string }[] = [
  { min: 90, grade: 'A', label: 'Excellent', color: 'green' },
  { min: 70, grade: 'B', label: 'Good', color: 'yellow' },
  { min: 50, grade: 'C', label: 'Needs Work', color: 'orange' },
  { min: 0, grade: 'D', label: 'Poor', color: 'red' },
];

export function getGrade(score: number): Grade {
  const clamped = Math.max(0, Math.min(100, score));

  for (const threshold of GRADE_THRESHOLDS) {
    if (clamped >= threshold.min) {
      return {
        grade: threshold.grade,
        label: threshold.label,
        color: threshold.color,
      };
    }
  }

  // Fallback, should never reach here
  return { grade: 'D', label: 'Poor', color: 'red' };
}
