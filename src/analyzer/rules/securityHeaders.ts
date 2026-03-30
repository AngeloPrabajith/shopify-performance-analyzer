import type { AnalysisRule } from '../../types/rules.js';
import type { AnalysisIssue } from '../../types/analysis.js';
import type { PageLoadResult } from '../../types/network.js';

export const securityHeadersRule: AnalysisRule = {
  id: 'security-headers',
  name: 'Security Headers',

  evaluate(data: PageLoadResult): AnalysisIssue[] {
    // Find the main document request to inspect its headers
    const docRequest = data.requests.find(
      (r) => r.resourceType === 'document',
    );
    if (!docRequest) return [];

    const headers = docRequest.headers;
    const issues: AnalysisIssue[] = [];

    // Normalize header keys to lowercase for reliable lookup
    const lowerHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      lowerHeaders[key.toLowerCase()] = value;
    }

    // Strict-Transport-Security
    if (!lowerHeaders['strict-transport-security']) {
      issues.push({
        ruleId: 'security-headers',
        severity: 'warning',
        title: 'Missing Strict-Transport-Security (HSTS) header',
        description:
          'The server does not send an HSTS header. This header tells browsers to always use HTTPS, protecting visitors from protocol downgrade attacks and cookie hijacking.',
      });
    }

    // Content-Security-Policy
    if (!lowerHeaders['content-security-policy']) {
      issues.push({
        ruleId: 'security-headers',
        severity: 'info',
        title: 'Missing Content-Security-Policy (CSP) header',
        description:
          'No Content-Security-Policy header was found. CSP helps prevent cross-site scripting (XSS) and data injection attacks by controlling which resources the browser is allowed to load.',
      });
    }

    // X-Frame-Options
    if (!lowerHeaders['x-frame-options']) {
      issues.push({
        ruleId: 'security-headers',
        severity: 'info',
        title: 'Missing X-Frame-Options header',
        description:
          'The X-Frame-Options header is not set. This header prevents your site from being embedded in iframes on other domains, protecting against clickjacking attacks.',
      });
    }

    // X-Content-Type-Options
    if (!lowerHeaders['x-content-type-options']) {
      issues.push({
        ruleId: 'security-headers',
        severity: 'info',
        title: 'Missing X-Content-Type-Options header',
        description:
          'The X-Content-Type-Options header is not set. Setting it to "nosniff" prevents browsers from MIME-type sniffing, which can lead to security vulnerabilities.',
      });
    }

    return issues;
  },
};
