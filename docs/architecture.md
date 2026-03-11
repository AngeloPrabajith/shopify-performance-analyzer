# Architecture

## System Overview

```
                  +-------------+
                  |   CLI       |
                  |  (index.ts) |
                  +------+------+
                         |
                  +------v------+
                  | Orchestrator|
                  +------+------+
                         |
         +---------------+---------------+
         |               |               |
   +-----v-----+  +-----v-----+  +------v-----+
   |  Scraper   |  |  Analyzer |  |  Detectors |
   | (Playwright)|  | (Rules)   |  | (Fingerprints)|
   +-----+-----+  +-----+-----+  +------+-----+
         |               |               |
         v               v               v
   PageLoadResult   AnalysisIssue[]   DetectedApp[]
                         |               |
                  +------v------+        |
                  |   Scoring   |<-------+
                  +------+------+
                         |
                  +------v------+
                  |  Formatter  |
                  +-------------+
```

## Modules

### Scraper (`src/scraper/`)

Launches a headless Chromium browser via Playwright, navigates to the target URL, and captures all network responses during page load. Also runs `page.evaluate()` to collect `<head>` script tags with their `async` and `defer` attributes.

Key files:
- `pageScraper.ts` - Browser lifecycle and page navigation
- `requestMapper.ts` - Pure function that converts Playwright response objects into `NetworkRequest` types

The scraper waits for `networkidle` before closing, which means most dynamically loaded scripts will be captured. Navigation timeout defaults to 30 seconds.

### Analyzer (`src/analyzer/`)

The rule engine runs an array of `AnalysisRule` implementations against the scraped page data. Each rule receives the full `PageLoadResult` and returns zero or more `AnalysisIssue` objects.

Key design decisions:
- **Error isolation** - Each rule runs inside a try/catch so a single broken rule cannot crash the entire analysis
- **Stateless rules** - Rules are pure functions with no shared state between them
- **Registry pattern** - `ruleRegistry.ts` is the single place where rules are wired together

#### Built-in Rules

| Rule | ID | What it checks |
|------|----|----------------|
| Heavy Scripts | `heavy-scripts` | Scripts over 100kb |
| Duplicate Libraries | `duplicate-libraries` | Same library loaded from multiple URLs |
| Render Blocking | `render-blocking` | Scripts in `<head>` without async/defer |
| Image Optimization | `image-optimization` | Large images, legacy formats |
| Third-Party Impact | `third-party-impact` | External script weight |

### Detectors (`src/detectors/`)

Identifies installed Shopify apps by matching network request domains against a fingerprint database (`data/appFingerprints.json`). The fingerprint file contains app names, vendors, and known domains.

Domain matching supports both exact matches and subdomain matching (e.g., `sub.static.klaviyo.com` matches the `static.klaviyo.com` fingerprint).

### Scoring (`src/scoring/`)

Converts analysis issues into a 0-100 performance score using severity-based deductions:
- Critical: -15 points
- Warning: -5 points
- Info: -1 point

An additional 5-point penalty applies when more than 10 apps are detected. The score is also broken down by category (scripts, images, third-party).

Letter grades map to score ranges: A (90-100), B (70-89), C (50-69), D (below 50).

### CLI (`src/cli/`)

Thin layer that handles argument parsing, URL validation, and output formatting. The formatter builds a colored terminal report using chalk. Supports `--json` for machine-readable output.

## Adding a New Rule

1. Create a new file in `src/analyzer/rules/` implementing the `AnalysisRule` interface:

```typescript
import type { AnalysisRule } from '../../types/rules.js';

export const myRule: AnalysisRule = {
  id: 'my-rule',
  name: 'My Custom Rule',
  evaluate(data) {
    // Analyze data.requests, data.headScripts, etc.
    // Return an array of AnalysisIssue objects
    return [];
  },
};
```

2. Import and add it to the array in `src/analyzer/ruleRegistry.ts`
3. Add tests in `tests/analyzer/rules/myRule.test.ts`

## Data Flow

1. User provides a URL via CLI
2. Orchestrator calls the scraper, which returns a `PageLoadResult`
3. `PageLoadResult` is passed to the rule engine and the app detector in parallel
4. Rule engine produces `AnalysisIssue[]`, detector produces `DetectedApp[]`
5. Both are passed to the scorer, which produces a `ScoreBreakdown`
6. Everything flows to the formatter for terminal output (or JSON serialization)
