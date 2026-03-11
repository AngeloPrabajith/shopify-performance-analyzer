#!/usr/bin/env node

import { analyze } from '../orchestrator.js';
import { validateUrl } from './validator.js';
import { formatReport } from './formatter.js';
import { createSpinner } from './spinner.js';

interface CliFlags {
  json: boolean;
  verbose: boolean;
  timeout: number;
  url: string;
}

function parseArgs(argv: string[]): CliFlags {
  const args = argv.slice(2);
  const flags: CliFlags = {
    json: false,
    verbose: false,
    timeout: 30000,
    url: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      flags.json = true;
    } else if (arg === '--verbose') {
      flags.verbose = true;
    } else if (arg === '--timeout' && args[i + 1]) {
      const val = parseInt(args[i + 1], 10);
      if (!isNaN(val) && val > 0) flags.timeout = val;
      i++; // skip the value
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
    --json           Output raw JSON instead of formatted report
    --verbose        Show detailed request information
    --timeout <ms>   Navigation timeout in milliseconds (default: 30000)

  Examples:
    shopify-analyze https://store.myshopify.com
    shopify-analyze store.myshopify.com --json
    shopify-analyze store.myshopify.com --timeout 60000
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

  // Clean up on Ctrl+C
  const handleSigint = () => {
    spinner.stop('Cancelled.');
    process.exit(130);
  };
  process.on('SIGINT', handleSigint);

  try {
    const { result, apps, score } = await analyze(url, {
      timeout: flags.timeout,
    });
    spinner.stop();

    if (flags.json) {
      console.log(JSON.stringify({ result, apps, score }, null, 2));
    } else {
      const report = formatReport(result, apps, score);
      console.log(report);

      if (flags.verbose) {
        console.log(
          `\n  Total requests captured: ${result.metadata.totalRequests}`,
        );
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
  } finally {
    process.removeListener('SIGINT', handleSigint);
  }
}

main();
