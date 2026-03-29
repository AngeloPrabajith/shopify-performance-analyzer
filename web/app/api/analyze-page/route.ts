import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SCRAPER_URL = process.env.SCRAPER_API_URL || "";
const API_SECRET = process.env.SCRAPER_API_SECRET || "";

type PageType = "homepage" | "product" | "collection";
const VALID_PAGE_TYPES: PageType[] = ["homepage", "product", "collection"];

function isPrivateHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "[::1]") return true;
  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  let url: string;
  let pageType: PageType;

  try {
    const body = await req.json();
    url = body.url as string;
    pageType = body.pageType as PageType;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  if (!pageType || !VALID_PAGE_TYPES.includes(pageType)) {
    return NextResponse.json({ error: "Valid pageType is required" }, { status: 400 });
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

  if (SCRAPER_URL) {
    try {
      const res = await fetch(`${SCRAPER_URL}/analyze-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_SECRET ? { Authorization: `Bearer ${API_SECRET}` } : {}),
        },
        body: JSON.stringify({ url, pageType }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: body.error || `Scraper returned ${res.status}` },
          { status: res.status },
        );
      }

      return NextResponse.json(await res.json());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scraper service unavailable";
      console.error("[analyze-page]", message);
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json(
    { error: "Scraper service not configured. Set SCRAPER_API_URL." },
    { status: 503 },
  );
}
