/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')              // Trim hyphens from start
    .replace(/-+$/, '');             // Trim hyphens from end
}

/**
 * Generate a short 8-char ID from a UUID for clean SEO URLs
 */
function shortId(uuid: string): string {
  return uuid.replace(/-/g, '').slice(0, 8);
}

/**
 * Generate a listing URL with category and title slug
 * Format: /listing/category/title-slug-shortid
 */
export function generateListingUrl(id: string, categorySlug: string, title: string): string {
  const titleSlug = slugify(title);
  return `/listing/${categorySlug}/${titleSlug}-${shortId(id)}`;
}

/**
 * Extract listing short ID from URL slug
 * Returns the 8-char hex suffix from the slug
 */
export function extractShortId(slug: string): string | null {
  // Match 8 hex chars at the end of the slug
  const match = slug.match(/([0-9a-f]{8})$/i);
  return match ? match[1] : null;
}

/**
 * Extract listing ID from URL (handles old UUID format, new short ID format, and legacy)
 */
export function extractListingId(urlPath: string): string | null {
  // Full UUID pattern
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  // Legacy format with full UUID in slug: /listing/category/title-slug-{full-uuid}
  const legacyFullUuid = urlPath.match(/\/listing\/[^/]+\/.+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (legacyFullUuid) return legacyFullUuid[1];

  // Old format: /listing/{full-uuid}
  const oldFormat = urlPath.match(/\/listing\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (oldFormat) return oldFormat[1];

  // New short format: /listing/category/title-slug-{8hex}
  const shortFormat = urlPath.match(/\/listing\/[^/]+\/.+-([0-9a-f]{8})$/i);
  if (shortFormat) return shortFormat[1]; // Returns 8-char short ID

  // Fallback: any UUID in path
  const fallback = urlPath.match(uuidPattern);
  if (fallback) return fallback[0];

  return null;
}
