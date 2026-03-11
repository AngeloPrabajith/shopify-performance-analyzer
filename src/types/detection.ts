export interface AppFingerprint {
  appName: string;
  vendor: string;
  domains: string[];
  scriptPatterns?: string[];
}

export interface DetectedApp {
  appName: string;
  vendor: string;
  matchedDomain: string;
  scriptCount: number;
  totalSize: number;
}
