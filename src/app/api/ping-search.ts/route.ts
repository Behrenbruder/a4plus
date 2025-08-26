// app/api/ping-search/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const sitemapUrl = encodeURIComponent("https://www.a4plus.eu/sitemap.xml");

  // Google & Bing Ping-Endpoints
  const targets = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ];

  const results = await Promise.allSettled(
    targets.map((t) => fetch(t, { method: "GET", cache: "no-store" }))
  );

  const ok = results.every((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<Response>).value.ok);

  return NextResponse.json({
    ok,
    detail: results.map((r, i) => ({
      target: targets[i],
      status:
        r.status === "fulfilled"
          ? (r.value as Response).status
          : `error: ${(r as PromiseRejectedResult).reason}`,
    })),
  });
}
