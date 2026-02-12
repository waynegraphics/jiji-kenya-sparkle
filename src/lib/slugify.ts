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
 * Generate a listing URL with category and title slug
 */
export function generateListingUrl(id: string, categorySlug: string, title: string): string {
  const titleSlug = slugify(title);
  return `/listing/${categorySlug}/${titleSlug}-${id}`;
}

/**
 * Extract listing ID from URL (handles both old and new formats)
 */
export function extractListingId(urlPath: string): string | null {
  // UUID pattern: 8-4-4-4-12 hex characters
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  
  // New format: /listing/category/title-slug-{uuid}
  // Extract UUID from the end of the path
  const newFormatMatch = urlPath.match(/\/listing\/[^/]+\/.+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (newFormatMatch && newFormatMatch[1]) {
    return newFormatMatch[1];
  }
  
  // Old format: /listing/{uuid}
  const oldFormatMatch = urlPath.match(/\/listing\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (oldFormatMatch && oldFormatMatch[1]) {
    return oldFormatMatch[1];
  }
  
  // Fallback: try to find any UUID in the path (for edge cases)
  const fallbackMatch = urlPath.match(uuidPattern);
  if (fallbackMatch && fallbackMatch[1]) {
    return fallbackMatch[1];
  }
  
  return null;
}
