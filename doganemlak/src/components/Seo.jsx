import { Helmet } from "react-helmet-async";

const DEFAULT_OG_IMAGE = import.meta.env.VITE_OG_IMAGE_URL || "";

export default function Seo({
  title,
  description,
  canonical,
  jsonLd,
  /** Tam URL (https://...) önerilir */
  ogImage,
  ogType = "website",
}) {
  const imageUrl = ogImage || DEFAULT_OG_IMAGE || undefined;

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:type" content={ogType} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {imageUrl ? <meta name="twitter:card" content="summary_large_image" /> : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
