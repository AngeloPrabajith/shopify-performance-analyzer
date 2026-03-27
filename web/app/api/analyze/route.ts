import { NextRequest, NextResponse } from "next/server";
import { analyze, analyzeMultiPage } from "@analyzer";

export const maxDuration = 150; // Full scan needs up to 3 pages × 45s + buffer

function isPrivateHostname(hostname: string): boolean {
  // Block localhost variants
  if (hostname === "localhost" || hostname === "[::1]") return true;

  // Block private IPv4 ranges
  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (a === 127) return true;                          // 127.0.0.0/8
    if (a === 10) return true;                           // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true;    // 172.16.0.0/12
    if (a === 192 && b === 168) return true;             // 192.168.0.0/16
    if (a === 169 && b === 254) return true;             // 169.254.0.0/16
    if (a === 0) return true;                            // 0.0.0.0/8
  }

  return false;
}

export async function POST(req: NextRequest) {
  let url: string;
  let scanScope: "homepage" | "full" = "homepage";

  try {
    const body = await req.json();
    url = body.url as string;
    if (body.scanScope === "full") scanScope = "full";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "Only HTTP(S) URLs are allowed" }, { status: 400 });
  }

  if (isPrivateHostname(parsed.hostname)) {
    return NextResponse.json({ error: "Private/internal URLs are not allowed" }, { status: 400 });
  }

  try {
    const output =
      scanScope === "full"
        ? await analyzeMultiPage(url, { timeout: 45_000 })
        : await analyze(url, { timeout: 45_000 });

    return NextResponse.json(output);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("[analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
