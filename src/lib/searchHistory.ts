const STORAGE_KEY = "user_search_history";
const MAX_ENTRIES = 20;

interface SearchEntry {
  categoryId: string;
  categorySlug: string;
  timestamp: number;
}

export const trackSearchCategory = (categoryId: string, categorySlug: string) => {
  if (!categoryId || !categorySlug || categorySlug === "all") return;
  try {
    const existing: SearchEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const entry: SearchEntry = { categoryId, categorySlug, timestamp: Date.now() };
    // Prepend and deduplicate (keep latest per category)
    const filtered = existing.filter(e => e.categoryId !== categoryId);
    const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
};

/** Returns the most frequently searched category ID, or null */
export const getPreferredCategoryId = (): string | null => {
  try {
    const entries: SearchEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (entries.length === 0) return null;
    
    // Weight recent searches more heavily
    const now = Date.now();
    const scores: Record<string, number> = {};
    for (const entry of entries) {
      const ageHours = (now - entry.timestamp) / (1000 * 60 * 60);
      const weight = Math.max(0.1, 1 - ageHours / (24 * 7)); // Decay over 7 days
      scores[entry.categoryId] = (scores[entry.categoryId] || 0) + weight;
    }
    
    // Return highest scoring category
    let best: string | null = null;
    let bestScore = 0;
    for (const [id, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }
    return best;
  } catch {
    return null;
  }
};
