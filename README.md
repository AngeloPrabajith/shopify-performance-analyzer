# Shopify Performance Analyzer

A CLI tool that analyzes Shopify storefronts for performance issues, detects installed apps, and generates actionable reports.

## Quick Start

```bash
npx shopify-analyze https://your-store.myshopify.com
```

## What It Analyzes

- **Heavy scripts** - Flags JavaScript files over 100kb
- **Duplicate libraries** - Detects multiple loads of jQuery, Lodash, React, etc.
- **Render-blocking scripts** - Finds scripts in `<head>` without `async` or `defer`
- **Image optimization** - Identifies oversized images and legacy formats (PNG, BMP)
- **Third-party impact** - Measures total weight of external scripts
- **App detection** - Identifies installed Shopify apps from network requests

## Sample Output

```
────────────────────────────────────────────────────────────────
  Shopify Performance Report
  https://example-store.myshopify.com
  87 requests, 2.4mb transferred, loaded in 3.20s
────────────────────────────────────────────────────────────────

  Performance Score

  74 / 100  (B - Good)

    Scripts          65
    Images           95
    Third-party      80

────────────────────────────────────────────────────────────────

  Detected Apps

  * Klaviyo (Klaviyo)
    2 requests, 190.4kb
  * ReCharge (ReCharge)
    1 request, 45.2kb

────────────────────────────────────────────────────────────────

  Issues

  X Duplicate library: jQuery loaded 2 times
    jQuery was found at 2 different URLs.

  ! Heavy script: klaviyo.js (190.4kb)
    klaviyo.js is 190.4kb, exceeding the 100.0kb threshold.

  ! Render-blocking script: theme.js
    theme.js is loaded in <head> without async or defer.

  i Legacy format: hero-banner.png
    Converting to WebP or AVIF could save roughly 58kb.

────────────────────────────────────────────────────────────────

  Summary

  1 critical, 2 warnings, 1 info
  Potential savings: ~146kb
```

## CLI Options

```
shopify-analyze <url> [options]

Options:
  --json       Output raw JSON instead of formatted report
  --verbose    Show detailed request information
  --timeout    Navigation timeout in milliseconds (default: 30000)
```

## Project Structure

```
src/
  cli/           CLI entry point, formatter, spinner
  scraper/       Playwright page loading and network capture
  analyzer/      Rule engine and analysis rules
    rules/       Individual rule implementations
  detectors/     App detection from network fingerprints
  scoring/       Performance score calculation and grading
  types/         TypeScript interfaces
  utils/         Error types and shared helpers
data/
  appFingerprints.json    Known Shopify app signatures
tests/
docs/
  architecture.md
```

## How It Works

The tool uses Playwright to load the target URL in a headless Chromium browser. While the page loads, it captures every network response and collects script tags from the document `<head>`. That raw data flows through a rule engine where each rule independently evaluates the page and returns any issues it finds. Separately, network requests are matched against a fingerprint database to identify installed Shopify apps. Finally, a scoring system tallies deductions by severity to produce a 0-100 performance score.

See [docs/architecture.md](docs/architecture.md) for a deeper look at the system design.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## Adding a New Analysis Rule

1. Create a file in `src/analyzer/rules/` that implements the `AnalysisRule` interface
2. Register it in `src/analyzer/ruleRegistry.ts`
3. Add tests in `tests/analyzer/rules/`

## Adding a New App Fingerprint

Edit `data/appFingerprints.json` and add an entry with the app name, vendor, and known domains.

## License

MIT
