'use client';

import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { Leaf, Scan, Moon, Sun, Info, ShoppingCart, MessageCircle, ExternalLink, Plus } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import Link from 'next/link';

// Components
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductCard from '@/components/ProductCard';
import StatsCard from '@/components/StatsCard';
import WelcomeCard from '@/components/WelcomeCard';
import HowItWorks from '@/components/HowItWorks';
import FilterBar from '@/components/FilterBar';
import ScanHistory from '@/components/ScanHistory';
import AppFooter from '@/components/AppFooter';
import LanguageSelector from '@/components/LanguageSelector';
import TextSizeSelector from '@/components/TextSizeSelector';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import InstallPrompt from '@/components/InstallPrompt';

// i18n
import { useLanguage } from '@/lib/i18n';

// Hooks
import { useServiceWorker } from '@/hooks/useServiceWorker';

// Lazy load modals for better initial load performance
const ScoreInfoModal = lazy(() => import('@/components/modals/ScoreInfoModal'));
const ShoppingListModal = lazy(() => import('@/components/modals/ShoppingListModal'));
const ComparisonModal = lazy(() => import('@/components/modals/ComparisonModal'));
const ContactModal = lazy(() => import('@/components/modals/ContactModal'));
const ChatModal = lazy(() => import('@/components/modals/ChatModal'));

// Utils
import { fetchProduct, searchAlternatives, searchSimilarProducts, ProductData } from '@/lib/openfoodfacts';
import { calculateGrønnScore, GrønnScoreResult } from '@/lib/scoring';
import analytics from '@/lib/analytics';

// Types
interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  similarProducts?: ProductData[]; // KUN norske produkter
  timestamp?: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
  imageUrl?: string;
}

interface Filters {
  norwegianOnly: boolean;
  organic: boolean;
}

export default function Home() {
  // i18n
  const { t, language } = useLanguage();

  // Register service worker for PWA
  useServiceWorker();

  // Core state
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // Barcodes of favorited products
  const [isScrolled, setIsScrolled] = useState(false);

  // UI state
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ norwegianOnly: false, organic: false });

  // Modal state
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Shopping & comparison state
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [compareProducts, setCompareProducts] = useState<ScanResult[]>([]);

  // Loading state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('gronnest-darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Load scan history
    const savedHistory = localStorage.getItem('gronnest-history');
    if (savedHistory) {
      try {
        setRecentScans(JSON.parse(savedHistory));
      } catch {
        // Failed to parse history from localStorage
      }
    }

    // Load shopping list
    const savedShoppingList = localStorage.getItem('gronnest-shopping');
    if (savedShoppingList) {
      try {
        setShoppingList(JSON.parse(savedShoppingList));
      } catch {
        // Failed to parse shopping list from localStorage
      }
    }

    // Load favorites
    const savedFavorites = localStorage.getItem('gronnest-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        // Failed to parse favorites from localStorage
      }
    }

    // Mark initialization as complete
    setIsInitializing(false);

    // Prefetch barcode scanner library for faster scanner startup
    import('@zxing/browser').catch(() => {});
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (recentScans.length > 0) {
      localStorage.setItem('gronnest-history', JSON.stringify(recentScans));
    }
  }, [recentScans]);

  // Save shopping list to localStorage
  useEffect(() => {
    localStorage.setItem('gronnest-shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('gronnest-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('gronnest-darkmode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
    analytics.darkModeToggled(newMode);
  };

  // Handle barcode scan - optimized to show product immediately
  const handleScan = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setNotFoundBarcode(null);
    analytics.scanStarted();

    try {
      const product = await fetchProduct(barcode);

      if (!product) {
        setNotFoundBarcode(barcode);
        analytics.scanFailed(barcode, 'not_found');
        setIsLoading(false);
        return;
      }

      const score = calculateGrønnScore(product);

      // Show product immediately with basic data
      const initialResult: ScanResult = {
        product,
        score,
        alternatives: [],
        similarProducts: [],
        timestamp: Date.now()
      };
      setScanResult(initialResult);
      setShowScanner(false);
      setIsLoading(false);
      analytics.scanCompleted(barcode, score.total);

      // Add to history immediately (will be updated with extras later)
      setRecentScans((prev) => {
        const filtered = prev.filter((r) => r.product.barcode !== barcode);
        return [initialResult, ...filtered].slice(0, 50);
      });

      // Load extras in background (non-blocking)
      setIsLoadingExtras(true);
      loadProductExtras(product, barcode, initialResult);
    } catch {
      setError(`${t.somethingWentWrong}. ${t.tryAgain}.`);
      analytics.scanFailed(barcode, 'error');
      setIsLoading(false);
    }
  };

  // Load additional product data in background - PROGRESSIVELY
  const loadProductExtras = async (product: ProductData, barcode: string, baseResult: ScanResult) => {
    // Track current result state for progressive updates
    let currentResult = { ...baseResult };

    // Helper to update result progressively
    const updateResult = (updates: Partial<ScanResult>) => {
      currentResult = { ...currentResult, ...updates };
      setScanResult({ ...currentResult });
      // Update history
      setRecentScans((prev) => {
        const filtered = prev.filter((r) => r.product.barcode !== barcode);
        return [{ ...currentResult }, ...filtered].slice(0, 50);
      });
    };

    // Helper for timeout wrapper (5 second timeout for each API call)
    const withTimeout = <T,>(promise: Promise<T>, ms: number = 5000): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
      ]);
    };

    // Start all requests in parallel but handle them individually as they complete
    const similarPromise = withTimeout(searchSimilarProducts(product, 8), 5000);
    const alternativesPromise = product.category
      ? withTimeout(searchAlternatives(product.raw?.categories || product.category, 5, product.name), 5000)
      : Promise.resolve([]);

    // Handle similar Norwegian products
    similarPromise.then((similarResult) => {
      if (similarResult) {
        const similarProducts = similarResult.filter((p) => p.barcode !== product.barcode);
        updateResult({ similarProducts });
      }
    }).catch(() => {});

    // Handle alternatives
    alternativesPromise.then((altResult) => {
      if (altResult) {
        let alternatives = altResult.filter((a) => a.barcode !== product.barcode);
        // Apply filters
        if (filters.norwegianOnly) {
          alternatives = alternatives.filter(a =>
            a.origin?.toLowerCase().includes('norge') ||
            a.origin?.toLowerCase().includes('norway')
          );
        }
        if (filters.organic) {
          alternatives = alternatives.filter(a =>
            a.labels?.some(label =>
              label.toLowerCase().includes('økologisk') ||
              label.toLowerCase().includes('organic')
            )
          );
        }
        updateResult({ alternatives });
      }
    }).catch(() => {});

    // Wait for all to settle (don't block on errors)
    await Promise.allSettled([similarPromise, alternativesPromise]);
    setIsLoadingExtras(false);
  };

  // Shopping list handlers
  const addShoppingItem = (name: string, barcode?: string, imageUrl?: string) => {
    setShoppingList(prev => [...prev, {
      id: Date.now().toString(),
      name,
      checked: false,
      barcode,
      imageUrl
    }]);
    analytics.shoppingListAdd(name);
  };

  const addProductToShoppingList = (product: ProductData) => {
    addShoppingItem(product.name, product.barcode, product.imageUrl);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearCompletedItems = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };


  // Comparison handlers
  const addToComparison = (result: ScanResult) => {
    if (compareProducts.length < 2 && !compareProducts.find(p => p.product.barcode === result.product.barcode)) {
      setCompareProducts(prev => [...prev, result]);
    }
  };

  const removeFromComparison = (barcode: string) => {
    setCompareProducts(prev => prev.filter(p => p.product.barcode !== barcode));
  };

  // Clear history
  const clearHistory = () => {
    if (confirm(t.confirmClearHistory)) {
      setRecentScans([]);
      localStorage.removeItem('gronnest-history');
    }
  };

  // Toggle favorite
  const toggleFavorite = (barcode: string) => {
    setFavorites(prev => {
      if (prev.includes(barcode)) {
        return prev.filter(b => b !== barcode);
      } else {
        return [...prev, barcode];
      }
    });
  };

  // Get favorite scans (from recent scans that are favorited)
  const favoriteScans = recentScans.filter(scan => favorites.includes(scan.product.barcode));

  // Calculate average score
  const averageScore = recentScans.length > 0
    ? Math.round(recentScans.reduce((sum, r) => sum + r.score.total, 0) / recentScans.length)
    : 0;

  // Show loading skeleton during initialization
  if (isInitializing) {
    return <LoadingSkeleton />;
  }

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className={`header-sticky px-6 pt-safe pb-4 ${isScrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center justify-between animate-fade-in-up stagger-1">
          <div>
            <h1 className="text-display text-gray-900 dark:text-white flex items-center gap-2">
              {t.appName}
              <Leaf className="w-7 h-7 text-green-500" strokeWidth={2.5} />
            </h1>
            <p className="text-caption text-gray-500 dark:text-gray-400 mt-0.5">
              {t.appTagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Selector - only on larger screens */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Eco Mode toggle */}
            <Tooltip content={darkMode ? (language === 'nb' ? 'Lys modus' : 'Light mode') : (language === 'nb' ? 'Øko-modus (sparer energi)' : 'Eco mode (saves energy)')}>
              <button
                onClick={toggleDarkMode}
                className={`flex items-center gap-1.5 px-3 h-10 rounded-full shadow-sm border transition-all hover:scale-105 active:scale-95 ${
                  darkMode
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
                aria-label={darkMode ? t.lightMode : t.darkMode}
              >
                {darkMode ? (
                  <>
                    <Leaf className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">{language === 'nb' ? 'Øko' : 'Eco'}</span>
                  </>
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </Tooltip>

            {/* Shopping cart - only show if has items */}
            <Tooltip content={t.shoppingList}>
              <button
                onClick={() => setShowShoppingList(true)}
                className="relative w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
                aria-label={t.shoppingList}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {shoppingList.filter(i => !i.checked).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {shoppingList.filter(i => !i.checked).length}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onFilterChange={setFilters}
      />

      {/* Stats Card or Welcome Card */}
      {recentScans.length > 0 ? (
        <StatsCard
          averageScore={averageScore}
          scanCount={recentScans.length}
          onShowScoreInfo={() => {
            setShowScoreInfo(true);
            analytics.scoreInfoViewed();
          }}
          onShowComparison={() => {
            setShowComparison(true);
            analytics.comparisonStarted();
          }}
          showCompareButton={recentScans.length >= 2}
        />
      ) : (
        <WelcomeCard />
      )}

      {/* Main Scan Button - Glassmorphism Design */}
      <div className="flex flex-col items-center justify-center px-6 py-10 animate-fade-in-up stagger-3">
        <button
          onClick={() => { setShowScanner(true); setNotFoundBarcode(null); }}
          className="group relative px-8 py-6 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          aria-label={t.scanProduct}
        >
          {/* Gradient glow behind */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity" />

          {/* Content */}
          <div className="relative flex items-center gap-5">
            {/* Icon container */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-shadow">
              <Scan className="w-8 h-8 text-white" strokeWidth={2} />
            </div>

            {/* Text */}
            <div className="text-left">
              <span className="block text-xl font-bold text-gray-800 dark:text-white">
                {t.scanProduct}
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t.tapToScan}
              </span>
            </div>

            {/* Arrow */}
            <div className="ml-2 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-scale-in">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 dark:text-red-400 text-sm font-semibold hover:underline"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* Product Not Found - Contribute to OFF */}
      {notFoundBarcode && (
        <div className="mx-6 mb-6 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t.productNotFoundTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {t.barcodeNotInDatabase}: <span className="font-mono text-amber-700 dark:text-amber-400">{notFoundBarcode}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t.contributeDescription}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://world.openfoodfacts.org/cgi/product.pl?code=${notFoundBarcode}&lc=no`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.addToOpenFoodFacts}
                </a>
                <button
                  onClick={() => setNotFoundBarcode(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      <ScanHistory
        recentScans={recentScans}
        favoriteScans={favoriteScans}
        favorites={favorites}
        onSelectScan={setScanResult}
        onAddToShoppingList={addProductToShoppingList}
        onAddToComparison={addToComparison}
        onToggleFavorite={toggleFavorite}
        onClearHistory={clearHistory}
        compareCount={compareProducts.length}
      />

      {/* How It Works */}
      <HowItWorks onShowScoreInfo={() => setShowScoreInfo(true)} />

      {/* Footer */}
      <AppFooter onShowContact={() => setShowContact(true)} />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* AI Chat FAB - Apple-style subtle design */}
      <button
        onClick={() => {
          setShowChat(true);
          analytics.chatOpened();
        }}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
        aria-label={t.aiAssistant}
      >
        <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      </button>

      {/* ===== MODALS (Lazy loaded) ===== */}
      {showScoreInfo && (
        <Suspense fallback={null}>
          <ScoreInfoModal
            isOpen={showScoreInfo}
            onClose={() => setShowScoreInfo(false)}
          />
        </Suspense>
      )}

      {showShoppingList && (
        <Suspense fallback={null}>
          <ShoppingListModal
            isOpen={showShoppingList}
            onClose={() => setShowShoppingList(false)}
            items={shoppingList}
            recentScans={recentScans}
            onAddItem={addShoppingItem}
            onToggleItem={toggleShoppingItem}
            onRemoveItem={removeShoppingItem}
            onClearCompleted={clearCompletedItems}
          />
        </Suspense>
      )}

      {showComparison && (
        <Suspense fallback={null}>
          <ComparisonModal
            isOpen={showComparison}
            onClose={() => setShowComparison(false)}
            compareProducts={compareProducts}
            recentScans={recentScans}
            onAddToComparison={addToComparison}
            onRemoveFromComparison={removeFromComparison}
          />
        </Suspense>
      )}

      {showContact && (
        <Suspense fallback={null}>
          <ContactModal
            isOpen={showContact}
            onClose={() => setShowContact(false)}
          />
        </Suspense>
      )}

      {showChat && (
        <Suspense fallback={null}>
          <ChatModal
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        </Suspense>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          isLoading={isLoading}
        />
      )}

      {/* Product Result Modal */}
      {scanResult && (
        <ProductCard
          product={scanResult.product}
          score={scanResult.score}
          alternatives={scanResult.alternatives}
          similarProducts={scanResult.similarProducts}
          isLoadingExtras={isLoadingExtras}
          onClose={() => setScanResult(null)}
          onScanAgain={() => {
            setScanResult(null); // Close current card
            // Small delay to ensure modal closes before scanner opens
            setTimeout(() => setShowScanner(true), 50);
          }}
          onSelectProduct={(barcode) => {
            setScanResult(null); // Close current card
            handleScan(barcode); // Fetch and show the selected product
          }}
        />
      )}
    </main>
  );
}
