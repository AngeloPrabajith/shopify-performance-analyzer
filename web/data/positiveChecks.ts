import type { AnalyzeOutput, AnalysisResult, WaterfallEntry } from "@/types/analyzer";

export interface PositiveFinding {
  title: string;
  description: string;
}

export function derivePositiveFindings(
  output: AnalyzeOutput,
  activeResult: AnalysisResult
): PositiveFinding[] {
  const findings: PositiveFinding[] = [];
  const issues = activeResult.issues;
  const meta = activeResult.metadata;
  const waterfall: WaterfallEntry[] = output.waterfall ?? [];

  const hasImages = waterfall.some((r) => r.resourceType === "image");
  const hasScripts = waterfall.some((r) => r.resourceType === "script");

  // Image optimization
  const imageIssues = issues.filter((i) => i.ruleId === "image-optimization");
  if (hasImages && imageIssues.length === 0) {
    findings.push({
      title: "Optimized images",
      description: "Your images are well-sized and use efficient formats.",
    });
  }

  // No render-blocking scripts
  const renderBlocking = issues.filter((i) => i.ruleId === "render-blocking");
  if (hasScripts && renderBlocking.length === 0) {
    findings.push({
      title: "Scripts properly deferred",
      description: "All scripts use async or defer, avoiding render blocking.",
    });
  }

  // No duplicate libraries
  const duplicates = issues.filter((i) => i.ruleId === "duplicate-libraries");
  if (hasScripts && duplicates.length === 0) {
    findings.push({
      title: "Clean dependencies",
      description: "No duplicate libraries detected across your scripts.",
    });
  }

  // Good TTFB
  if (meta.ttfb != null && meta.ttfb < 800) {
    findings.push({
      title: "Fast server response",
      description: `Your server responds in ${meta.ttfb}ms, well under the 800ms threshold.`,
    });
  }

  // Good FCP
  if (meta.fcp != null && meta.fcp < 1800) {
    findings.push({
      title: "Quick first paint",
      description: `Content appears in ${(meta.fcp / 1000).toFixed(1)}s, faster than the recommended 1.8s.`,
    });
  }

  // Good LCP
  if (meta.lcp != null && meta.lcp < 2500) {
    findings.push({
      title: "Fast content rendering",
      description: `Main content loads in ${(meta.lcp / 1000).toFixed(1)}s, under the 2.5s target.`,
    });
  }

  // Low CLS
  if (meta.cls != null && meta.cls < 0.1) {
    findings.push({
      title: "Stable layout",
      description: `Layout shift score of ${meta.cls.toFixed(3)} means minimal visual movement during load.`,
    });
  }

  // Reasonable third-party load
  const criticalThirdParty = issues.filter(
    (i) => i.ruleId === "third-party-impact" && i.severity === "critical"
  );
  if (criticalThirdParty.length === 0) {
    findings.push({
      title: "Manageable third-party load",
      description: "Third-party scripts are within acceptable size limits.",
    });
  }

  // Accessibility
  const a11yIssues = issues.filter((i) => i.ruleId === "accessibility");
  if (a11yIssues.length === 0) {
    findings.push({
      title: "Good accessibility basics",
      description: "Page language, alt text, headings, and landmarks all look good.",
    });
  }

  // SEO
  const seoIssues = issues.filter((i) => i.ruleId === "seo-checks");
  if (seoIssues.length === 0) {
    findings.push({
      title: "Strong SEO foundation",
      description: "Title, meta description, OG tags, and structured data are all present.",
    });
  }

  // Security headers
  const securityIssues = issues.filter((i) => i.ruleId === "security-headers");
  if (securityIssues.length === 0) {
    findings.push({
      title: "Solid security headers",
      description: "All recommended security headers are in place.",
    });
  }

  return findings;
}
