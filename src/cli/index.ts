#!/usr/bin/env node

import { analyze } from '../orchestrator.js';
import { validateUrl } from './validator.js';
import { formatReport } from './formatter.js';
import { createSpinner } from './spinner.js';

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const flags = {
    json: false,
    verbose: false,
    url: '',
  };

  for (const arg of args) {
    if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--verbose') {
      flags.verbose = true;
    } else if (!arg.startsWith('--')) {
      flags.url = arg;
    }
  }

  return flags;
}

function printUsage() {
  console.log(`
  Usage: shopify-analyze <url> [options]

  Options:
    --json      Output raw JSON instead of formatted report
    --verbose   Show detailed request information

  Examples:
    shopify-analyze https://store.myshopify.com
    shopify-analyze store.myshopify.com --json
  `);
}

async function main() {
  const flags = parseArgs(process.argv);

  if (!flags.url) {
    printUsage();
    process.exit(1);
  }

  let url: string;
  try {
    url = validateUrl(flags.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n  Error: ${message}\n`);
    process.exit(1);
  }

  const spinner = createSpinner(`Analyzing ${url}...`);
  spinner.start();

  try {
    const { result, apps, score } = await analyze(url);
    spinner.stop();

    if (flags.json) {
      console.log(JSON.stringify({ result, apps, score }, null, 2));
    } else {
      const report = formatReport(result, apps, score);
      console.log(report);

      if (flags.verbose) {
        console.log(`\n  Total requests captured: ${result.metadata.totalRequests}`);
        for (const issue of result.issues) {
          if (issue.resourceUrl) {
            console.log(`    ${issue.resourceUrl}`);
          }
        }
        console.log('');
      }
    }
  } catch (err) {
    spinner.stop();
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n  Analysis failed: ${message}\n`);
    process.exit(1);
  }
}

main();
