'use client';

import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { Leaf, Scan, Moon, Sun, User, ShoppingCart, MessageCircle } from 'lucide-react';

// Components
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductCard from '@/components/ProductCard';
import StatsCard from '@/components/StatsCard';
import WelcomeCard from '@/components/WelcomeCard';
import HowItWorks from '@/components/HowItWorks';
import TrustSignals from '@/components/TrustSignals';
import FilterBar from '@/components/FilterBar';
import ScanHistory from '@/components/ScanHistory';
import AppFooter from '@/components/AppFooter';

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
interface SimilarProducts {
  norwegian: ProductData[];
  other: ProductData[];
}

interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  similarProducts?: SimilarProducts;
  timestamp?: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
}

interface Filters {
  norwegianOnly: boolean;
  organic: boolean;
}

export default function Home() {
  // Core state
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
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

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('gronnvalg-darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Load scan history
    const savedHistory = localStorage.getItem('gronnvalg-history');
    if (savedHistory) {
      try {
        setRecentScans(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    // Load shopping list
    const savedShoppingList = localStorage.getItem('gronnvalg-shopping');
    if (savedShoppingList) {
      try {
        setShoppingList(JSON.parse(savedShoppingList));
      } catch (e) {
        console.error('Failed to load shopping list:', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (recentScans.length > 0) {
      localStorage.setItem('gronnvalg-history', JSON.stringify(recentScans));
    }
  }, [recentScans]);

  // Save shopping list to localStorage
  useEffect(() => {
    localStorage.setItem('gronnvalg-shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

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
    localStorage.setItem('gronnvalg-darkmode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
    analytics.darkModeToggled(newMode);
  };

  // Handle barcode scan
  const handleScan = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    analytics.scanStarted();

    try {
      const product = await fetchProduct(barcode);

      if (!product) {
        setError(`Produktet med strekkode ${barcode} ble ikke funnet. Prøv et annet produkt.`);
        analytics.scanFailed(barcode, 'not_found');
        setIsLoading(false);
        return;
      }

      const score = calculateGrønnScore(product);

      // Fetch both alternatives and similar products in parallel
      let alternatives: ProductData[] = [];
      let similarProducts: SimilarProducts = { norwegian: [], other: [] };

      // Always search for similar products
      const [altResult, similarResult] = await Promise.all([
        product.category
          ? searchAlternatives(product.raw?.categories || product.category, 5, product.name)
          : Promise.resolve([]),
        searchSimilarProducts(product, 6),
      ]);

      alternatives = altResult.filter((a) => a.barcode !== product.barcode);
      similarProducts = similarResult;

      // Apply filters to alternatives
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

      const result: ScanResult = { product, score, alternatives, similarProducts, timestamp: Date.now() };
      setScanResult(result);
      setShowScanner(false);
      analytics.scanCompleted(barcode, score.total);

      setRecentScans((prev) => {
        const filtered = prev.filter((r) => r.product.barcode !== barcode);
        return [result, ...filtered].slice(0, 50);
      });
    } catch (err) {
      console.error('Error scanning:', err);
      setError('Noe gikk galt. Prøv igjen.');
      analytics.scanFailed(barcode, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Shopping list handlers
  const addShoppingItem = (name: string) => {
    setShoppingList(prev => [...prev, {
      id: Date.now().toString(),
      name,
      checked: false
    }]);
    analytics.shoppingListAdd(name);
  };

  const addProductToShoppingList = (product: ProductData) => {
    setShoppingList(prev => [...prev, {
      id: Date.now().toString(),
      name: product.name,
      checked: false,
      barcode: product.barcode
    }]);
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
    if (confirm('Er du sikker på at du vil slette all historikk?')) {
      setRecentScans([]);
      localStorage.removeItem('gronnvalg-history');
    }
  };

  // Calculate average score
  const averageScore = recentScans.length > 0
    ? Math.round(recentScans.reduce((sum, r) => sum + r.score.total, 0) / recentScans.length)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className={`header-sticky px-6 pt-8 pb-4 ${isScrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center justify-between animate-fade-in-up stagger-1">
          <div>
            <h1 className="text-display text-gray-900 dark:text-white flex items-center gap-2">
              GrønnValg
              <Leaf className="w-7 h-7 text-green-500" strokeWidth={2.5} />
            </h1>
            <p className="text-caption text-gray-500 dark:text-gray-400 mt-0.5">
              Velg grønnere, lev bedre
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label={darkMode ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <button
              onClick={() => setShowShoppingList(true)}
              className="relative w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Handleliste"
            >
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
              {shoppingList.filter(i => !i.checked).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {shoppingList.filter(i => !i.checked).length}
                </span>
              )}
            </button>

            <button
              className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label="Profil"
            >
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </button>
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

      {/* Main Scan Button */}
      <div className="flex flex-col items-center justify-center px-6 py-10 animate-fade-in-up stagger-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-pulse-ring" />
          <button
            onClick={() => setShowScanner(true)}
            className="relative scan-button animate-breathe w-44 h-44 rounded-full flex flex-col items-center justify-center"
            aria-label="Skann produkt"
          >
            <div className="absolute inset-6 border-2 border-white/30 rounded-lg">
              <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-[3px] border-l-[3px] border-white rounded-tl-md" />
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-[3px] border-r-[3px] border-white rounded-tr-md" />
              <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-[3px] border-l-[3px] border-white rounded-bl-md" />
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-[3px] border-r-[3px] border-white rounded-br-md" />
            </div>
            <Scan className="w-14 h-14 text-white mb-2" strokeWidth={1.5} />
            <span className="text-white font-semibold text-lg">Skann produkt</span>
          </button>
        </div>
        <p className="text-base font-medium text-gray-500 dark:text-gray-400 mt-6">
          Trykk for å skanne en strekkode
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-scale-in">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 dark:text-red-400 text-sm font-semibold hover:underline"
          >
            Lukk
          </button>
        </div>
      )}

      {/* Scan History */}
      <ScanHistory
        recentScans={recentScans}
        onSelectScan={setScanResult}
        onAddToShoppingList={addProductToShoppingList}
        onAddToComparison={addToComparison}
        onClearHistory={clearHistory}
        compareCount={compareProducts.length}
      />

      {/* How It Works */}
      <HowItWorks onShowScoreInfo={() => setShowScoreInfo(true)} />

      {/* Trust Signals */}
      <TrustSignals />

      {/* Footer */}
      <AppFooter onShowContact={() => setShowContact(true)} />

      {/* AI Chat FAB */}
      <button
        onClick={() => {
          setShowChat(true);
          analytics.chatOpened();
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
        aria-label="Åpne AI-chat"
      >
        <MessageCircle className="w-6 h-6" />
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
          onClose={() => setScanResult(null)}
        />
      )}
    </main>
  );
}
