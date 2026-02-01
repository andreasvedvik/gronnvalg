'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult } from '@/lib/scoring';

/**
 * Represents a scanned product with its score and related products
 */
export interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  similarProducts?: ProductData[];
  timestamp?: number;
}

/**
 * Represents an item in the shopping list
 */
export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
  imageUrl?: string;
}

/**
 * Filter options for product search
 */
export interface Filters {
  norwegianOnly: boolean;
  organic: boolean;
}

interface AppState {
  // Product state
  scanResult: ScanResult | null;
  isLoading: boolean;
  isLoadingExtras: boolean;
  error: string | null;
  notFoundBarcode: string | null;

  // History & favorites
  recentScans: ScanResult[];
  favorites: string[];

  // Shopping list
  shoppingList: ShoppingItem[];

  // Comparison
  compareProducts: ScanResult[];

  // Filters
  filters: Filters;

  // UI state
  darkMode: boolean;
  isInitialized: boolean;

  // Actions - Product
  setScanResult: (result: ScanResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsLoadingExtras: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotFoundBarcode: (barcode: string | null) => void;
  updateScanResult: (updates: Partial<ScanResult>) => void;

  // Actions - History
  addToHistory: (result: ScanResult) => void;
  clearHistory: () => void;

  // Actions - Favorites
  toggleFavorite: (barcode: string) => void;
  isFavorite: (barcode: string) => boolean;

  // Actions - Shopping list
  addShoppingItem: (name: string, barcode?: string, imageUrl?: string) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedItems: () => void;

  // Actions - Comparison
  addToComparison: (result: ScanResult) => void;
  removeFromComparison: (barcode: string) => void;
  clearComparison: () => void;

  // Actions - Filters
  setFilters: (filters: Filters) => void;

  // Actions - UI
  toggleDarkMode: () => void;
  setInitialized: (initialized: boolean) => void;

  // Computed
  favoriteScans: () => ScanResult[];
  averageScore: () => number;
  uncheckedShoppingCount: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      scanResult: null,
      isLoading: false,
      isLoadingExtras: false,
      error: null,
      notFoundBarcode: null,
      recentScans: [],
      favorites: [],
      shoppingList: [],
      compareProducts: [],
      filters: { norwegianOnly: false, organic: false },
      darkMode: false,
      isInitialized: false,

      // Product actions
      setScanResult: (result) => set({ scanResult: result }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsLoadingExtras: (loading) => set({ isLoadingExtras: loading }),
      setError: (error) => set({ error }),
      setNotFoundBarcode: (barcode) => set({ notFoundBarcode: barcode }),

      updateScanResult: (updates) => {
        const { scanResult, recentScans } = get();
        if (!scanResult) return;

        const updatedResult = { ...scanResult, ...updates };
        const barcode = scanResult.product.barcode;

        // Update history as well
        const updatedHistory = recentScans.map((r) =>
          r.product.barcode === barcode ? updatedResult : r
        );

        set({
          scanResult: updatedResult,
          recentScans: updatedHistory,
        });
      },

      // History actions
      addToHistory: (result) => {
        const { recentScans } = get();
        const filtered = recentScans.filter(
          (r) => r.product.barcode !== result.product.barcode
        );
        set({ recentScans: [result, ...filtered].slice(0, 50) });
      },

      clearHistory: () => set({ recentScans: [] }),

      // Favorites actions
      toggleFavorite: (barcode) => {
        const { favorites } = get();
        if (favorites.includes(barcode)) {
          set({ favorites: favorites.filter((b) => b !== barcode) });
        } else {
          set({ favorites: [...favorites, barcode] });
        }
      },

      isFavorite: (barcode) => get().favorites.includes(barcode),

      // Shopping list actions
      addShoppingItem: (name, barcode, imageUrl) => {
        const { shoppingList } = get();
        set({
          shoppingList: [
            ...shoppingList,
            {
              id: Date.now().toString(),
              name,
              checked: false,
              barcode,
              imageUrl,
            },
          ],
        });
      },

      toggleShoppingItem: (id) => {
        const { shoppingList } = get();
        set({
          shoppingList: shoppingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        });
      },

      removeShoppingItem: (id) => {
        const { shoppingList } = get();
        set({ shoppingList: shoppingList.filter((item) => item.id !== id) });
      },

      clearCompletedItems: () => {
        const { shoppingList } = get();
        set({ shoppingList: shoppingList.filter((item) => !item.checked) });
      },

      // Comparison actions
      addToComparison: (result) => {
        const { compareProducts } = get();
        if (
          compareProducts.length < 2 &&
          !compareProducts.find((p) => p.product.barcode === result.product.barcode)
        ) {
          set({ compareProducts: [...compareProducts, result] });
        }
      },

      removeFromComparison: (barcode) => {
        const { compareProducts } = get();
        set({
          compareProducts: compareProducts.filter(
            (p) => p.product.barcode !== barcode
          ),
        });
      },

      clearComparison: () => set({ compareProducts: [] }),

      // Filter actions
      setFilters: (filters) => set({ filters }),

      // UI actions
      toggleDarkMode: () => {
        const { darkMode } = get();
        const newMode = !darkMode;
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newMode);
        }
        set({ darkMode: newMode });
      },

      setInitialized: (initialized) => set({ isInitialized: initialized }),

      // Computed values (as functions to ensure they always get fresh data)
      favoriteScans: () => {
        const { recentScans, favorites } = get();
        return recentScans.filter((scan) =>
          favorites.includes(scan.product.barcode)
        );
      },

      averageScore: () => {
        const { recentScans } = get();
        if (recentScans.length === 0) return 0;
        return Math.round(
          recentScans.reduce((sum, r) => sum + r.score.total, 0) /
            recentScans.length
        );
      },

      uncheckedShoppingCount: () => {
        const { shoppingList } = get();
        return shoppingList.filter((i) => !i.checked).length;
      },
    }),
    {
      name: 'gronnest-storage',
      partialize: (state) => ({
        // Only persist these fields
        recentScans: state.recentScans,
        favorites: state.favorites,
        shoppingList: state.shoppingList,
        darkMode: state.darkMode,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on rehydration
        if (state?.darkMode && typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
        // Mark as initialized
        state?.setInitialized(true);
      },
    }
  )
);
