// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://www.a4plus.eu";

  // hier alle kanonischen URLs deiner Seite eintragen
  const urls = [
    "/",                         // Start
    "/pv-rechner",
    "/kontakt",
    "/pv",
    "/batteriespeicher",
    "/produkte/fenster",
    "/produkte/tueren",
    "/produkte/rollaeden",
    "/produkte/daemmung",
    "/produkte/waermepumpen",
  ];

  const lastmod = new Date().toISOString();

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls
      .map(
        (u) => `
      <url>
        <loc>${base}${u}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${u === "/" ? "1.0" : "0.7"}</priority>
      </url>`
      )
      .join("") +
    `</urlset>`;

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
