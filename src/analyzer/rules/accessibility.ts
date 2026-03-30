import type { AnalysisRule } from '../../types/rules.js';
import type { AnalysisIssue } from '../../types/analysis.js';
import type { PageLoadResult } from '../../types/network.js';

export const accessibilityRule: AnalysisRule = {
  id: 'accessibility',
  name: 'Accessibility Quick Checks',

  evaluate(data: PageLoadResult): AnalysisIssue[] {
    const a11y = data.accessibilityData;
    if (!a11y) return [];

    const issues: AnalysisIssue[] = [];

    // Missing html lang attribute
    if (!a11y.htmlLang) {
      issues.push({
        ruleId: 'accessibility',
        severity: 'critical',
        title: 'Missing language attribute on <html>',
        description:
          'The page does not declare a language (e.g., <html lang="en">). Screen readers need this to pronounce content correctly, and search engines use it for language detection.',
      });
    }

    // Images without alt text
    if (a11y.imagesWithoutAlt > 0) {
      const pct = Math.round((a11y.imagesWithoutAlt / a11y.totalImages) * 100);
      const severity = pct > 50 ? 'critical' : 'warning';
      issues.push({
        ruleId: 'accessibility',
        severity,
        title: `${a11y.imagesWithoutAlt} of ${a11y.totalImages} images missing alt text (${pct}%)`,
        description:
          'Images without alt attributes are invisible to screen readers and hurt SEO. Add descriptive alt text to product images and meaningful banners.',
        resourceUrl: a11y.missingAltUrls[0] || undefined,
      });
    }

    // Missing h1
    if (a11y.h1Count === 0 && a11y.headingLevels.length > 0) {
      issues.push({
        ruleId: 'accessibility',
        severity: 'warning',
        title: 'Page is missing an <h1> heading',
        description:
          'Every page should have exactly one H1 heading that describes its main content. This helps screen readers and search engines understand the page structure.',
      });
    }

    // Multiple h1s
    if (a11y.h1Count > 1) {
      issues.push({
        ruleId: 'accessibility',
        severity: 'info',
        title: `Page has ${a11y.h1Count} <h1> headings (should have 1)`,
        description:
          'Having multiple H1 tags can confuse screen readers and dilute SEO value. Keep one H1 per page for the main title.',
      });
    }

    // Skipped heading levels
    for (let i = 1; i < a11y.headingLevels.length; i++) {
      if (a11y.headingLevels[i] - a11y.headingLevels[i - 1] > 1) {
        issues.push({
          ruleId: 'accessibility',
          severity: 'info',
          title: `Heading hierarchy skips from H${a11y.headingLevels[i - 1]} to H${a11y.headingLevels[i]}`,
          description:
            'Heading levels should be sequential (H1 then H2, not H1 then H3). Skipping levels makes the page harder to navigate with assistive technology.',
        });
        break;
      }
    }

    // Form inputs without labels
    if (a11y.formsWithoutLabels > 0) {
      issues.push({
        ruleId: 'accessibility',
        severity: 'warning',
        title: `${a11y.formsWithoutLabels} of ${a11y.totalFormInputs} form inputs missing labels`,
        description:
          'Form fields need associated labels so screen reader users know what to enter. Use <label for="id">, aria-label, or wrap the input in a <label> element.',
      });
    }

    // Missing main landmark
    if (!a11y.hasMainLandmark) {
      issues.push({
        ruleId: 'accessibility',
        severity: 'info',
        title: 'Missing <main> landmark',
        description:
          'A <main> element or role="main" landmark helps screen reader users skip navigation and jump straight to the primary content.',
      });
    }

    return issues;
  },
};
