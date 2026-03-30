import type { AnalysisRule } from '../../types/rules.js';
import type { AnalysisIssue } from '../../types/analysis.js';
import type { PageLoadResult } from '../../types/network.js';

export const seoChecksRule: AnalysisRule = {
  id: 'seo-checks',
  name: 'SEO Quick Checks',

  evaluate(data: PageLoadResult): AnalysisIssue[] {
    const seo = data.seoData;
    if (!seo) return [];

    const issues: AnalysisIssue[] = [];

    // Missing page title
    if (!seo.title) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'critical',
        title: 'Page is missing a <title> tag',
        description:
          'The page has no title element. Search engines display the title in results and use it as a primary ranking signal. Every page needs a unique, descriptive title.',
      });
    }

    // Title too long
    if (seo.title && seo.titleLength > 60) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'info',
        title: `Page title is ${seo.titleLength} characters (recommended under 60)`,
        description:
          'Google typically displays the first 50-60 characters of a title. Longer titles get truncated in search results, which can reduce click-through rates.',
      });
    }

    // Missing meta description
    if (!seo.metaDescription) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'warning',
        title: 'Missing meta description',
        description:
          'The page has no meta description tag. Search engines show this snippet in results -- without one, Google will auto-generate a snippet that may not represent your page well.',
      });
    }

    // Meta description too long
    if (seo.metaDescription && seo.metaDescriptionLength > 160) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'info',
        title: `Meta description is ${seo.metaDescriptionLength} characters (recommended under 160)`,
        description:
          'Search engines typically truncate meta descriptions over 155-160 characters. Keep it concise to ensure the full description is visible in search results.',
      });
    }

    // Missing Open Graph tags
    if (!seo.ogTitle && !seo.ogDescription && !seo.ogImage) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'info',
        title: 'Missing Open Graph (OG) tags',
        description:
          'No Open Graph meta tags were found. OG tags control how links appear when shared on Facebook, Twitter, Slack, and other platforms. Without them, shared links may look plain or show incorrect previews.',
      });
    }

    // Missing canonical URL
    if (!seo.canonical) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'warning',
        title: 'Missing canonical URL',
        description:
          'No <link rel="canonical"> tag was found. Canonical URLs tell search engines which version of a page is the "official" one, preventing duplicate content issues that can dilute your rankings.',
      });
    }

    // Missing structured data
    if (!seo.hasStructuredData) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'info',
        title: 'No structured data (JSON-LD) found',
        description:
          'The page has no JSON-LD structured data. Adding Product, Organization, or BreadcrumbList schema can earn rich snippets in Google results (star ratings, price, availability), which boost click-through rates.',
      });
    }

    // Missing or empty h1
    if (seo.h1Count === 0) {
      issues.push({
        ruleId: 'seo-checks',
        severity: 'warning',
        title: 'Page has no <h1> heading',
        description:
          'The H1 tag tells search engines (and users) what the page is about. Every page should have one clear, descriptive H1 that includes relevant keywords.',
      });
    }

    return issues;
  },
};
