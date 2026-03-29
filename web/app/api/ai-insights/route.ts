import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AnalyzeOutput } from "@/types/analyzer";

export const maxDuration = 30;

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI insights unavailable - API key not set." },
      { status: 503 }
    );
  }

  let output: AnalyzeOutput;
  try {
    output = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { result, apps, score } = output;
  const criticalIssues = result.issues.filter((i) => i.severity === "critical");
  const warnings = result.issues.filter((i) => i.severity === "warning");

  const { ttfb, fcp, lcp, cls } = result.metadata;

  const prompt = `You are a Shopify performance expert. Analyze this storefront performance report and provide concise, actionable recommendations.

Store: ${result.metadata.url}

Performance Score: ${score.overall}/100
Categories: ${JSON.stringify(score.categories)}

Core Web Vitals:
- TTFB: ${ttfb != null ? `${ttfb}ms` : "unavailable"}
- FCP: ${fcp != null ? `${fcp}ms` : "unavailable"}
- LCP: ${lcp != null ? `${lcp}ms` : "unavailable"}
- CLS: ${cls != null ? cls : "unavailable"}
- Load time: ${(result.metadata.loadTime / 1000).toFixed(2)}s
- Total requests: ${result.metadata.totalRequests}
- Transfer size: ${(result.metadata.totalTransferSize / 1024).toFixed(1)} KB

Critical Issues (${criticalIssues.length}):
${criticalIssues.slice(0, 8).map((i) => `- ${i.title}: ${i.description}${i.savingsKb ? ` (saves ~${i.savingsKb}KB)` : ""}`).join("\n") || "None"}

Warnings (${warnings.length}):
${warnings.slice(0, 5).map((i) => `- ${i.title}: ${i.description}`).join("\n") || "None"}

Detected Apps (${apps.length}):
${apps.slice(0, 8).map((a) => `- ${a.appName} by ${a.vendor} (${a.scriptCount} scripts, ${(a.totalSize / 1024).toFixed(1)} KB)`).join("\n") || "None detected"}

Respond with raw JSON only (no markdown). Do not use em dashes in any text. Use plain hyphens or commas instead.

{
  "summary": "2-3 sentence plain English summary of the store performance health and biggest opportunities",
  "grade": "A+|A|B+|B|C+|C|D|F",
  "benchmark": "Where this score ranks vs typical Shopify stores (e.g. Top 20%, Below average)",
  "topFixes": [
    {
      "priority": 1,
      "title": "Short action title",
      "impact": "high|medium|low",
      "description": "What to do and why, under 70 words",
      "codeSnippet": "Optional short code example or null"
    }
  ],
  "quickWins": ["short string", "short string", "short string"],
  "appWarning": "If more than 8 apps detected, note about app overload. Otherwise null."
}

Maximum 5 topFixes.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1400,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response - handle potential truncation
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI returned unexpected format");
    }

    let insights;
    try {
      insights = JSON.parse(jsonMatch[0]);
    } catch {
      // Response was truncated mid-JSON - extract what we can
      // Build a minimal valid response from partial data
      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/);
      const gradeMatch = text.match(/"grade"\s*:\s*"([^"]+)"/);
      const benchmarkMatch = text.match(/"benchmark"\s*:\s*"([^"]+)"/);
      insights = {
        summary: summaryMatch?.[1] ?? "Analysis completed. Expand individual fixes below for details.",
        grade: gradeMatch?.[1] ?? "?",
        benchmark: benchmarkMatch?.[1] ?? null,
        topFixes: [],
        quickWins: [],
        appWarning: null,
      };
    }

    return NextResponse.json(insights);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    console.error("[ai-insights]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
