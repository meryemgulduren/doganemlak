const fs = require("fs/promises");
const path = require("path");
const Listing = require("../models/Listing");

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function resolveSiteUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    "https://www.doganemlak.com";
  return raw.replace(/\/$/, "");
}

function buildStaticUrls(siteUrl) {
  const now = new Date().toISOString().slice(0, 10);
  return [
    { loc: `${siteUrl}/`, lastmod: now, changefreq: "daily", priority: "1.0" },
    { loc: `${siteUrl}/ilanlar`, lastmod: now, changefreq: "hourly", priority: "0.9" },
    { loc: `${siteUrl}/kiralik`, lastmod: now, changefreq: "daily", priority: "0.85" },
    { loc: `${siteUrl}/satilik`, lastmod: now, changefreq: "daily", priority: "0.85" },
    { loc: `${siteUrl}/gayrimenkul-danismanlar`, lastmod: now, changefreq: "weekly", priority: "0.7" },
  ];
}

function toXml(urls) {
  const body = urls
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
${body}
</urlset>
`;
}

async function refreshPublicSitemap() {
  const siteUrl = resolveSiteUrl();
  const listings = await Listing.find({ status: "ACTIVE" })
    .select("_id updatedAt listing_date createdAt")
    .sort({ updatedAt: -1 })
    .lean();

  const listingUrls = listings.map((item) => ({
    loc: `${siteUrl}/ilan/${item._id}`,
    lastmod: formatDate(item.updatedAt || item.listing_date || item.createdAt),
    changefreq: "daily",
    priority: "0.8",
  }));

  const urls = [...buildStaticUrls(siteUrl), ...listingUrls];
  const xml = toXml(urls);

  const sitemapPath = path.resolve(__dirname, "../doganemlak/public/sitemap.xml");
  await fs.writeFile(sitemapPath, xml, "utf8");
}

module.exports = { refreshPublicSitemap };
