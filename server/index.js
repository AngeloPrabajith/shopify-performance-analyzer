import http from "node:http";
import { analyze, analyzeMultiPage, analyzeSinglePage } from "../dist/index.js";

const PORT = parseInt(process.env.PORT || "3002", 10);
const API_SECRET = process.env.API_SECRET || "";
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || "20", 10);

// ── Rate limiter (resets daily) ──────────────────────────────────
let dailyCount = 0;
let lastReset = Date.now();

function checkRateLimit() {
  const now = Date.now();
  if (now - lastReset > 86_400_000) {
    dailyCount = 0;
    lastReset = now;
  }
  if (dailyCount >= DAILY_LIMIT) return false;
  dailyCount++;
  return true;
}

// ── Helpers ──────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function cors(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end();
}

// ── Auth check ───────────────────────────────────────────────────
function checkAuth(req) {
  if (!API_SECRET) return true;
  const header = req.headers.authorization || "";
  return header === `Bearer ${API_SECRET}`;
}

// ── Server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "POST only" });
  if (!checkAuth(req)) return json(res, 401, { error: "Unauthorized" });
  if (!checkRateLimit())
    return json(res, 429, {
      error: `Daily scan limit reached (${DAILY_LIMIT}). Resets in ${Math.ceil((86_400_000 - (Date.now() - lastReset)) / 3_600_000)}h.`,
    });

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    const body = await readBody(req);

    if (path === "/analyze") {
      const scanScope = body.scanScope === "full" ? "full" : "homepage";
      const output =
        scanScope === "full"
          ? await analyzeMultiPage(body.url, { timeout: 45_000 })
          : await analyze(body.url, { timeout: 45_000 });
      return json(res, 200, output);
    }

    if (path === "/analyze-page") {
      const page = await analyzeSinglePage(body.url, body.pageType, {
        timeout: 45_000,
      });
      return json(res, 200, page);
    }

    // PDF: receive HTML, render to PDF via Playwright
    if (path === "/render-pdf") {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(body.html, { waitUntil: "load" });
      const pdf = await page.pdf({
        format: "A4",
        margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
        printBackground: true,
      });
      await browser.close();

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="loadly-report.pdf"`,
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(pdf);
    }

    if (path === "/health") {
      return json(res, 200, {
        status: "ok",
        scansToday: dailyCount,
        dailyLimit: DAILY_LIMIT,
      });
    }

    return json(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("[scraper]", err.message || err);
    return json(res, 500, {
      error: err.message || "Internal server error",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Loadly scraper running on :${PORT} (limit: ${DAILY_LIMIT} scans/day)`);
});
