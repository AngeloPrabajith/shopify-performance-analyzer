export interface ScoreBreakdown {
  overall: number;
  categories: Record<string, number>;
}

export interface Grade {
  grade: string;
  label: string;
  color: string;
}
