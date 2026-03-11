import chalk from 'chalk';
import type { AnalysisResult, AnalysisIssue } from '../types/analysis.js';
import type { DetectedApp } from '../types/detection.js';
import type { ScoreBreakdown } from '../types/scoring.js';
import { getGrade } from '../scoring/grader.js';

const SEVERITY_ICONS: Record<string, string> = {
  critical: '\u2718',  // heavy ballot X
  warning: '\u26A0',   // warning sign
  info: '\u2139',      // info circle
};

const SEVERITY_COLORS: Record<string, (s: string) => string> = {
  critical: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)}kb`;
}

function divider(width = 60): string {
  return chalk.gray('\u2500'.repeat(width));
}

function formatScore(score: ScoreBreakdown): string {
  const grade = getGrade(score.overall);
  const colorFn =
    grade.color === 'green'
      ? chalk.green
      : grade.color === 'yellow'
        ? chalk.yellow
        : grade.color === 'orange'
          ? chalk.hex('#FF8C00')
          : chalk.red;

  const lines = [
    '',
    chalk.bold('  Performance Score'),
    '',
    `  ${colorFn(chalk.bold(`${score.overall}`))} / 100  ${colorFn(`(${grade.grade} - ${grade.label})`)}`,
  ];

  // Category breakdown if we have any
  const cats = Object.entries(score.categories);
  if (cats.length > 0) {
    lines.push('');
    for (const [name, catScore] of cats) {
      const catGrade = getGrade(catScore);
      const catColor =
        catGrade.color === 'green'
          ? chalk.green
          : catGrade.color === 'yellow'
            ? chalk.yellow
            : catGrade.color === 'orange'
              ? chalk.hex('#FF8C00')
              : chalk.red;
      const label = name.charAt(0).toUpperCase() + name.slice(1);
      lines.push(`    ${label.padEnd(16)} ${catColor(`${catScore}`)}`);
    }
  }

  return lines.join('\n');
}

function formatIssues(issues: AnalysisIssue[]): string {
  if (issues.length === 0) {
    return `\n  ${chalk.green('No issues found!')}\n`;
  }

  const grouped: Record<string, AnalysisIssue[]> = {
    critical: [],
    warning: [],
    info: [],
  };

  for (const issue of issues) {
    grouped[issue.severity]?.push(issue);
  }

  const lines = ['', chalk.bold('  Issues'), ''];

  for (const severity of ['critical', 'warning', 'info'] as const) {
    const group = grouped[severity];
    if (group.length === 0) continue;

    const icon = SEVERITY_ICONS[severity];
    const colorFn = SEVERITY_COLORS[severity];

    for (const issue of group) {
      lines.push(`  ${colorFn(`${icon} ${issue.title}`)}`);
      if (issue.description) {
        lines.push(`    ${chalk.gray(issue.description)}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

function formatApps(apps: DetectedApp[]): string {
  if (apps.length === 0) {
    return `\n  ${chalk.gray('No third-party apps detected.')}\n`;
  }

  const lines = ['', chalk.bold('  Detected Apps'), ''];

  for (const app of apps) {
    const size = formatKb(app.totalSize);
    const count = app.scriptCount === 1 ? '1 request' : `${app.scriptCount} requests`;
    lines.push(
      `  ${chalk.cyan('\u2022')} ${chalk.white(app.appName)} ${chalk.gray(`(${app.vendor})`)}`,
    );
    lines.push(`    ${chalk.gray(`${count}, ${size}`)}`);
  }

  return lines.join('\n');
}

function formatSummary(issues: AnalysisIssue[]): string {
  const criticals = issues.filter((i) => i.severity === 'critical').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const infos = issues.filter((i) => i.severity === 'info').length;

  const totalSavings = issues.reduce((sum, i) => sum + (i.savingsKb || 0), 0);

  const parts = [];
  if (criticals > 0) parts.push(chalk.red(`${criticals} critical`));
  if (warnings > 0) parts.push(chalk.yellow(`${warnings} warnings`));
  if (infos > 0) parts.push(chalk.blue(`${infos} info`));

  const lines = ['', chalk.bold('  Summary'), ''];
  lines.push(`  ${parts.join(', ') || chalk.green('No issues')}`);

  if (totalSavings > 0) {
    lines.push(`  Potential savings: ${chalk.green(`~${totalSavings}kb`)}`);
  }

  return lines.join('\n');
}

export function formatReport(
  result: AnalysisResult,
  apps: DetectedApp[],
  score: ScoreBreakdown,
): string {
  const { metadata } = result;
  const lines: string[] = [];

  lines.push('');
  lines.push(divider());
  lines.push(`  ${chalk.bold('Shopify Performance Report')}`);
  lines.push(`  ${chalk.gray(metadata.url)}`);
  lines.push(
    `  ${chalk.gray(`${metadata.totalRequests} requests, ${formatKb(metadata.totalTransferSize)} transferred, loaded in ${(metadata.loadTime / 1000).toFixed(2)}s`)}`,
  );
  lines.push(divider());

  lines.push(formatScore(score));
  lines.push(divider());

  lines.push(formatApps(apps));
  lines.push(divider());

  lines.push(formatIssues(result.issues));
  lines.push(divider());

  lines.push(formatSummary(result.issues));
  lines.push('');

  return lines.join('\n');
}
