import { NextRequest, NextResponse } from "next/server";

interface AnalyzeOutput {
  result: {
    metadata: { url: string; loadTime: number; totalRequests: number; totalTransferSize: number; ttfb?: number; fcp?: number; lcp?: number; cls?: number };
    issues: Array<{ title: string; description: string; severity: string; savingsKb?: number }>;
  };
  apps: Array<{ appName: string; vendor: string; scriptCount: number; totalSize: number }>;
  score: { overall: number; categories: Record<string, number> };
}

export const maxDuration = 30;

interface ScoreBreakdown {
  overall: number;
  categories: Record<string, number>;
}

function gradeFor(score: number) {
  if (score >= 90) return { letter: "A", label: "Excellent", color: "#22C55E" };
  if (score >= 70) return { letter: "B", label: "Good", color: "#F59E0B" };
  if (score >= 50) return { letter: "C", label: "Needs Work", color: "#FF8C00" };
  return { letter: "D", label: "Poor", color: "#EF4444" };
}

function vitalColor(metric: string, value: number): string {
  const thresholds: Record<string, [number, number]> = {
    ttfb: [800, 1800],
    fcp: [1800, 3000],
    lcp: [2500, 4000],
    cls: [0.1, 0.25],
  };
  const [good, poor] = thresholds[metric] || [Infinity, Infinity];
  if (value <= good) return "#22C55E";
  if (value <= poor) return "#F59E0B";
  return "#EF4444";
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildReportHtml(output: AnalyzeOutput): string {
  const { result, apps, score } = output;
  const meta = result.metadata;
  const grade = gradeFor(score.overall);

  const vitals = [
    meta.ttfb != null ? { label: "TTFB", value: `${meta.ttfb}ms`, color: vitalColor("ttfb", meta.ttfb) } : null,
    meta.fcp != null ? { label: "FCP", value: `${meta.fcp}ms`, color: vitalColor("fcp", meta.fcp) } : null,
    meta.lcp != null ? { label: "LCP", value: `${meta.lcp}ms`, color: vitalColor("lcp", meta.lcp) } : null,
    meta.cls != null ? { label: "CLS", value: `${meta.cls}`, color: vitalColor("cls", meta.cls) } : null,
  ].filter(Boolean) as { label: string; value: string; color: string }[];

  const criticals = result.issues.filter((i) => i.severity === "critical");
  const warnings = result.issues.filter((i) => i.severity === "warning");
  const infos = result.issues.filter((i) => i.severity === "info");

  const categoryHtml = Object.entries(score.categories)
    .map(([name, val]) => {
      const g = gradeFor(val);
      return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9">
        <span style="text-transform:capitalize">${escapeHtml(name)}</span>
        <span style="font-weight:600;color:${g.color}">${val}</span>
      </div>`;
    })
    .join("");

  const issueHtml = (issues: typeof result.issues, icon: string, color: string) =>
    issues
      .slice(0, 15)
      .map(
        (i) => `<div style="margin-bottom:8px">
          <div style="color:${color};font-weight:500">${icon} ${escapeHtml(i.title)}</div>
          <div style="color:#64748b;font-size:12px;margin-left:20px">${escapeHtml(i.description)}</div>
        </div>`,
      )
      .join("");

  const appHtml = apps
    .slice(0, 15)
    .map(
      (a) => `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9">${escapeHtml(a.appName)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;color:#64748b">${escapeHtml(a.vendor)}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${a.scriptCount}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${(a.totalSize / 1024).toFixed(1)} KB</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1e293b; padding:40px; max-width:800px; margin:0 auto; }
    h1 { font-size:24px; margin-bottom:4px; }
    h2 { font-size:16px; margin:28px 0 12px; color:#334155; border-bottom:2px solid #e2e8f0; padding-bottom:6px; }
    .header { margin-bottom:24px; }
    .url { color:#64748b; font-size:13px; word-break:break-all; }
    .stats { display:flex; gap:24px; margin-top:12px; font-size:13px; color:#475569; }
    .score-box { display:flex; align-items:center; gap:20px; padding:20px; background:#f8fafc; border-radius:12px; margin:16px 0; }
    .score-number { font-size:48px; font-weight:700; }
    .grade-label { font-size:18px; font-weight:600; }
    .vitals { display:flex; gap:16px; flex-wrap:wrap; margin:12px 0; }
    .vital { padding:8px 14px; border-radius:8px; background:#f8fafc; text-align:center; }
    .vital-value { font-size:16px; font-weight:600; }
    .vital-label { font-size:11px; color:#64748b; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { text-align:left; padding:8px 12px; background:#f8fafc; font-weight:600; font-size:12px; color:#475569; }
    th:nth-child(3), th:nth-child(4) { text-align:right; }
    .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:11px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Loadly Report</h1>
    <div class="url">${escapeHtml(meta.url)}</div>
    <div class="stats">
      <span>${meta.totalRequests} requests</span>
      <span>${(meta.totalTransferSize / 1024).toFixed(1)} KB transferred</span>
      <span>Loaded in ${(meta.loadTime / 1000).toFixed(2)}s</span>
    </div>
  </div>

  <div class="score-box">
    <div class="score-number" style="color:${grade.color}">${score.overall}</div>
    <div>
      <div class="grade-label" style="color:${grade.color}">${grade.letter} - ${grade.label}</div>
      <div style="color:#64748b;font-size:13px;margin-top:2px">out of 100</div>
    </div>
  </div>

  ${vitals.length > 0 ? `
  <h2>Core Web Vitals</h2>
  <div class="vitals">
    ${vitals.map((v) => `<div class="vital"><div class="vital-value" style="color:${v.color}">${v.value}</div><div class="vital-label">${v.label}</div></div>`).join("")}
  </div>` : ""}

  ${categoryHtml ? `<h2>Category Breakdown</h2>${categoryHtml}` : ""}

  ${criticals.length > 0 ? `<h2>Critical Issues (${criticals.length})</h2>${issueHtml(criticals, "&#10006;", "#EF4444")}` : ""}
  ${warnings.length > 0 ? `<h2>Warnings (${warnings.length})</h2>${issueHtml(warnings, "&#9888;", "#F59E0B")}` : ""}
  ${infos.length > 0 ? `<h2>Info (${infos.length})</h2>${issueHtml(infos, "&#8505;", "#3B82F6")}` : ""}

  ${apps.length > 0 ? `
  <h2>Detected Apps (${apps.length})</h2>
  <table>
    <thead><tr><th>App</th><th>Vendor</th><th>Requests</th><th>Size</th></tr></thead>
    <tbody>${appHtml}</tbody>
  </table>` : ""}

  <div class="footer">
    Generated by Loadly &middot; ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
}

const SCRAPER_URL = process.env.SCRAPER_API_URL || "";
const API_SECRET = process.env.SCRAPER_API_SECRET || "";

export async function POST(req: NextRequest) {
  let output: AnalyzeOutput;
  try {
    output = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!output?.result?.metadata) {
    return NextResponse.json({ error: "Missing analysis data" }, { status: 400 });
  }

  const html = buildReportHtml(output);

  // If scraper service is configured, proxy PDF rendering to it
  if (SCRAPER_URL) {
    try {
      const res = await fetch(`${SCRAPER_URL}/render-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_SECRET ? { Authorization: `Bearer ${API_SECRET}` } : {}),
        },
        body: JSON.stringify({ html }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Scraper returned ${res.status}`);
      }

      const pdf = await res.arrayBuffer();
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="loadly-report-${Date.now()}.pdf"`,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF generation failed";
      console.error("[export-pdf]", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Scraper service not configured. Set SCRAPER_API_URL." },
    { status: 503 },
  );
}
