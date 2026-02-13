import { create } from "zustand";

interface CompareItem {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  categoryId: string;
  categorySlug?: string;
  details?: Record<string, any>;
}

interface CompareStore {
  items: CompareItem[];
  addItem: (item: CompareItem) => boolean;
  removeItem: (id: string) => void;
  clearAll: () => void;
  canAdd: (categoryId: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const state = get();
    if (state.items.length >= 3) return false;
    if (state.items.some((i) => i.id === item.id)) return false;
    if (state.items.length > 0 && state.items[0].categoryId !== item.categoryId) return false;
    set({ items: [...state.items, item] });
    return true;
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  clearAll: () => set({ items: [] }),
  canAdd: (categoryId) => {
    const state = get();
    if (state.items.length >= 3) return false;
    if (state.items.length > 0 && state.items[0].categoryId !== categoryId) return false;
    return true;
  },
}));
