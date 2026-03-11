export class ScraperError extends Error {
  code: string;

  constructor(message: string, code = 'SCRAPER_ERROR') {
    super(message);
    this.name = 'ScraperError';
    this.code = code;
  }
}

export class AnalysisError extends Error {
  code: string;

  constructor(message: string, code = 'ANALYSIS_ERROR') {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
  }
}

export class ValidationError extends Error {
  code: string;

  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}
