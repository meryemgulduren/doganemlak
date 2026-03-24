import { writeFile } from "node:fs/promises";

const SITE_URL = (process.env.SITE_URL || "https://www.doganemlak.com").replace(/\/$/, "");
const API_URL = process.env.API_URL;

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

async function fetchListings() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    if (!json?.success || !Array.isArray(json?.data)) return [];
    return json.data;
  } catch {
    return [];
  }
}

function staticUrls() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { loc: `${SITE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_URL}/ilanlar`, lastmod: today, changefreq: "hourly", priority: "0.9" },
    { loc: `${SITE_URL}/kiralik`, lastmod: today, changefreq: "daily", priority: "0.85" },
    { loc: `${SITE_URL}/satilik`, lastmod: today, changefreq: "daily", priority: "0.85" },
    { loc: `${SITE_URL}/gayrimenkul-danismanlar`, lastmod: today, changefreq: "weekly", priority: "0.7" },
  ];
}

function listingUrls(listings) {
  return listings
    .filter((item) => item?._id)
    .map((item) => ({
      loc: `${SITE_URL}/ilan/${item._id}`,
      lastmod: normalizeDate(item.updatedAt || item.listing_date || item.createdAt),
      changefreq: "daily",
      priority: "0.8",
    }));
}

function toXml(urls) {
  const rows = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>
`;
}

async function run() {
  const listings = await fetchListings();
  const urls = [...staticUrls(), ...listingUrls(listings)];
  const xml = toXml(urls);
  await writeFile(new URL("./public/sitemap.xml", import.meta.url), xml, "utf8");
  console.log(`sitemap.xml updated with ${urls.length} URLs`);
}

run();
