import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { AppFingerprint } from '../types/detection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FINGERPRINT_PATH = resolve(__dirname, '../../data/appFingerprints.json');

export function loadFingerprints(): AppFingerprint[] {
  try {
    const raw = readFileSync(FINGERPRINT_PATH, 'utf-8');
    return JSON.parse(raw) as AppFingerprint[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Failed to load app fingerprints: ${message}`);
    return [];
  }
}
