/**
 * The canonical origin, in one place.
 *
 * ⚠ PLACEHOLDER. `olelibre.example` is not a real domain, and it still carries
 * the "Olé" the brand dropped. Set NEXT_PUBLIC_SITE_URL before launch — it is
 * what absolute URLs in the metadata and in the product structured data are
 * built from, so a wrong value here publishes wrong links to search engines.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://libre.example';
