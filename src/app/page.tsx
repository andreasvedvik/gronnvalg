'use client';

import { useState, useEffect } from 'react';
import {
  Scan,
  User,
  Leaf,
  TrendingUp,
  History,
  Camera,
  Sparkles,
  MapPin,
  Shield,
  Database,
  ChevronRight,
  Moon,
  Sun,
  HelpCircle,
  X,
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  Mail,
  MessageCircle,
  Info,
  Filter,
  ArrowLeftRight,
  Send,
  Bot,
  ChevronDown
} from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductCard from '@/components/ProductCard';
import { fetchProduct, searchAlternatives, ProductData } from '@/lib/openfoodfacts';
import { calculateGrønnScore, GrønnScoreResult, getScoreColor, getScoreTextColor } from '@/lib/scoring';

interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  timestamp?: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // New state for features
  const [darkMode, setDarkMode] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [newShoppingItem, setNewShoppingItem] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ norwegianOnly: false, organic: false });
  const [showComparison, setShowComparison] = useState(false);
  const [compareProducts, setCompareProducts] = useState<ScanResult[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showContact, setShowContact] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('gronnvalg-darkmode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleScan = async (barcode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching product:', barcode);
      const product = await fetchProduct(barcode);

      if (!product) {
        setError(`Produktet med strekkode ${barcode} ble ikke funnet. Prøv et annet produkt.`);
        setIsLoading(false);
        return;
      }

      console.log('Product found:', product.name);

      // Calculate GrønnScore
      const score = calculateGrønnScore(product);
      console.log('Score calculated:', score.total);

      // Search for alternatives
      let alternatives: ProductData[] = [];
      if (product.category) {
        alternatives = await searchAlternatives(product.category);
        alternatives = alternatives.filter((a) => a.barcode !== product.barcode);

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
      }

      const result: ScanResult = { product, score, alternatives, timestamp: Date.now() };
      setScanResult(result);
      setShowScanner(false);

      setRecentScans((prev) => {
        const filtered = prev.filter((r) => r.product.barcode !== barcode);
        return [result, ...filtered].slice(0, 50); // Keep more history
      });
    } catch (err) {
      console.error('Error scanning:', err);
      setError('Noe gikk galt. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeResult = () => {
    setScanResult(null);
    setError(null);
  };

  // Shopping list functions
  const addShoppingItem = () => {
    if (!newShoppingItem.trim()) return;
    setShoppingList(prev => [...prev, {
      id: Date.now().toString(),
      name: newShoppingItem.trim(),
      checked: false
    }]);
    setNewShoppingItem('');
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const addToShoppingList = (product: ProductData) => {
    setShoppingList(prev => [...prev, {
      id: Date.now().toString(),
      name: product.name,
      checked: false,
      barcode: product.barcode
    }]);
  };

  // Comparison functions
  const addToComparison = (result: ScanResult) => {
    if (compareProducts.length < 2 && !compareProducts.find(p => p.product.barcode === result.product.barcode)) {
      setCompareProducts(prev => [...prev, result]);
    }
  };

  const removeFromComparison = (barcode: string) => {
    setCompareProducts(prev => prev.filter(p => p.product.barcode !== barcode));
  };

  // AI Chat function (simplified - would need actual AI integration)
  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = '';
      const input = chatInput.toLowerCase();

      if (input.includes('grønn') && input.includes('brød')) {
        response = 'For grønnere brødvalg, se etter økologiske alternativer fra lokale bakerier. Produkter med kort ingrediensliste og norsk korn scorer ofte høyt. Prøv å skanne "Økologisk grovbrød" fra Bakehuset!';
      } else if (input.includes('norsk') || input.includes('lokal')) {
        response = 'Norske produkter har ofte lavere klimaavtrykk pga. kortere transport. Se etter "Nyt Norge"-merket eller sjekk produktets opprinnelsesland i appen.';
      } else if (input.includes('økologisk') || input.includes('organic')) {
        response = 'Økologiske produkter dyrkes uten syntetiske sprøytemidler. Bruk filteret "Kun økologisk" for å finne sertifiserte alternativer!';
      } else if (input.includes('score') || input.includes('poeng')) {
        response = 'GrønnScore beregnes basert på: miljøpåvirkning, næringsinnhold, opprinnelse og emballasje. A er best (80-100), E er dårligst (0-40).';
      } else {
        response = 'Jeg kan hjelpe deg med å finne grønnere produktvalg! Spør meg om bærekraftige alternativer, hva GrønnScore betyr, eller tips for miljøvennlig handling.';
      }

      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setChatInput('');
  };

  const averageScore =
    recentScans.length > 0
      ? Math.round(recentScans.reduce((sum, r) => sum + r.score.total, 0) / recentScans.length)
      : 0;

  return (
    <main className={`min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800`}>
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
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
              aria-label={darkMode ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Shopping List Button */}
            <button
              onClick={() => setShowShoppingList(true)}
              className="relative w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
              {shoppingList.filter(i => !i.checked).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {shoppingList.filter(i => !i.checked).length}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-6 mb-4 animate-fade-in-up stagger-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-soft border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all hover:border-green-300"
        >
          <Filter className="w-4 h-4" />
          Filtre
          {(filters.norwegianOnly || filters.organic) && (
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 animate-scale-in">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.norwegianOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, norwegianOnly: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">🇳🇴 Kun norske produkter</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.organic}
                  onChange={(e) => setFilters(prev => ({ ...prev, organic: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">🌱 Kun økologisk</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Stats Card */}
      {recentScans.length > 0 && (
        <div className="mx-6 mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-caption text-gray-600 dark:text-gray-400">
                Din gjennomsnittlige GrønnScore
              </span>
              <button
                onClick={() => setShowScoreInfo(true)}
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="Hva er GrønnScore?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${getScoreTextColor(averageScore)}`}>
              {averageScore}
            </span>
            <span className="text-gray-400 dark:text-gray-500 mb-1 font-medium">/100</span>
            <span className="ml-auto text-caption text-gray-500 dark:text-gray-400">
              Basert på {recentScans.length} skann
            </span>
          </div>
          <div className="mt-4 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreColor(averageScore)} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${averageScore}%` }}
            />
          </div>

          {/* Comparison Button */}
          {recentScans.length >= 2 && (
            <button
              onClick={() => setShowComparison(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Sammenlign produkter
            </button>
          )}
        </div>
      )}

      {/* Welcome Card */}
      {recentScans.length === 0 && (
        <div className="mx-6 mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up stagger-2">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-500" strokeWidth={2} />
            </div>
            <h2 className="text-title text-gray-900 dark:text-white mb-2">
              Velkommen til GrønnValg!
            </h2>
            <p className="text-body text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Skann produkter for å se bærekraft-score og finne grønnere norske alternativer.
            </p>
          </div>
        </div>
      )}

      {/* Main Scan Button */}
      <div className="flex flex-col items-center justify-center px-6 py-10 animate-fade-in-up stagger-3">
        <div className="relative">
          {/* Pulse ring effect */}
          <div className="absolute inset-0 rounded-full animate-pulse-ring" />

          <button
            onClick={() => setShowScanner(true)}
            className="relative scan-button animate-breathe w-44 h-44 rounded-full flex flex-col items-center justify-center"
          >
            {/* Scanner bracket overlay */}
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

        {/* LARGER helper text */}
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

      {/* Recent Scans / History */}
      {recentScans.length > 0 && (
        <div className="px-6 pb-6 animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-overline text-gray-400 dark:text-gray-500 flex items-center gap-2">
              <History className="w-4 h-4" />
              Skannehistorikk ({recentScans.length})
            </h3>
            <button
              onClick={() => {
                if (confirm('Er du sikker på at du vil slette all historikk?')) {
                  setRecentScans([]);
                  localStorage.removeItem('gronnvalg-history');
                }
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Slett alt
            </button>
          </div>
          <div className="space-y-3">
            {recentScans.slice(0, 10).map((result, i) => (
              <div
                key={result.product.barcode}
                className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 card-hover text-left group"
              >
                <button
                  onClick={() => setScanResult(result)}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {result.product.imageUrl ? (
                      <img
                        src={result.product.imageUrl}
                        alt={result.product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Leaf className="w-6 h-6 text-gray-300 dark:text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {result.product.name}
                    </p>
                    <p className="text-caption text-gray-500 dark:text-gray-400 truncate">
                      {result.product.brand}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 ${getScoreColor(result.score.total)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <span className="text-white font-bold">{result.score.grade}</span>
                  </div>
                </button>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => addToShoppingList(result.product)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                    title="Legg til handleliste"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToComparison(result)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Sammenlign"
                    disabled={compareProducts.length >= 2}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="px-6 pb-8 animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-overline text-gray-400 dark:text-gray-500">
            Slik fungerer det
          </h3>
          <button
            onClick={() => setShowScoreInfo(true)}
            className="text-xs text-green-600 dark:text-green-400 font-medium hover:underline flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            Hva er GrønnScore?
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-caption font-medium text-gray-700 dark:text-gray-300">Skann strekkode</p>
          </div>
          <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-caption font-medium text-gray-700 dark:text-gray-300">Se GrønnScore</p>
          </div>
          <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-caption font-medium text-gray-700 dark:text-gray-300">Finn alternativer</p>
          </div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="px-6 pb-8 animate-fade-in-up stagger-6">
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <Database className="w-4 h-4" />
            <span className="text-xs font-medium">2M+ produkter</span>
          </div>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Ingen data lagres</span>
          </div>
        </div>
      </div>

      {/* Footer with Contact Info */}
      <footer className="px-6 pb-8 text-center safe-bottom">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg"
            alt="Open Food Facts"
            className="h-5 opacity-50 dark:invert"
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Data fra{' '}
          <a
            href="https://openfoodfacts.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 hover:underline font-medium"
          >
            Open Food Facts
          </a>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">GrønnValg © 2026</p>

        {/* Contact Info */}
        <button
          onClick={() => setShowContact(true)}
          className="mt-4 text-xs text-green-600 dark:text-green-400 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <Mail className="w-3 h-3" />
          Kontakt oss
        </button>
      </footer>

      {/* AI Chat Button (FAB) */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
        aria-label="Åpne AI-chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* ===== MODALS ===== */}

      {/* GrønnScore Info Modal */}
      {showScoreInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowScoreInfo(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hva er GrønnScore?</h2>
                <button onClick={() => setShowScoreInfo(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                GrønnScore er vår bærekraftvurdering som hjelper deg å ta grønnere valg. Scoren beregnes basert på flere faktorer:
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Miljøpåvirkning</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CO2-utslipp, vannforbruk og arealbruk</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Opprinnelse</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Norske produkter gir høyere score</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Næringsinnhold</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nutri-Score og ingredienser</p>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Karakterskala:</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { grade: 'A', range: '80-100', color: 'bg-green-500' },
                    { grade: 'B', range: '60-79', color: 'bg-lime-500' },
                    { grade: 'C', range: '40-59', color: 'bg-yellow-500' },
                    { grade: 'D', range: '20-39', color: 'bg-orange-500' },
                    { grade: 'E', range: '0-19', color: 'bg-red-500' },
                  ].map(item => (
                    <div key={item.grade} className="text-center">
                      <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                        <span className="text-white font-bold">{item.grade}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowShoppingList(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Handleliste
                </h2>
                <button onClick={() => setShowShoppingList(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Add item input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newShoppingItem}
                  onChange={(e) => setNewShoppingItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
                  placeholder="Legg til vare..."
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addShoppingItem}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Shopping list items */}
              {shoppingList.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Handlelisten er tom. Legg til varer ovenfor eller fra skannede produkter.
                </p>
              ) : (
                <div className="space-y-2">
                  {shoppingList.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <button
                        onClick={() => toggleShoppingItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.checked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`flex-1 ${item.checked ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeShoppingItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {shoppingList.length > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between text-sm text-gray-500">
                  <span>{shoppingList.filter(i => i.checked).length} av {shoppingList.length} fullført</span>
                  <button
                    onClick={() => setShoppingList(prev => prev.filter(i => !i.checked))}
                    className="text-green-600 hover:underline"
                  >
                    Fjern fullførte
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowComparison(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  Sammenlign produkter
                </h2>
                <button onClick={() => setShowComparison(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Velg opptil 2 produkter fra historikken for å sammenligne
              </p>

              {/* Selected products for comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[0, 1].map((index) => {
                  const product = compareProducts[index];
                  return (
                    <div key={index} className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl min-h-[200px] flex flex-col items-center justify-center">
                      {product ? (
                        <div className="text-center w-full">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                            {product.product.imageUrl ? (
                              <img src={product.product.imageUrl} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Leaf className="w-8 h-8 text-gray-400 m-4" />
                            )}
                          </div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.product.name}</p>
                          <div className={`mt-2 w-12 h-12 ${getScoreColor(product.score.total)} rounded-xl flex items-center justify-center mx-auto`}>
                            <span className="text-white font-bold text-lg">{product.score.grade}</span>
                          </div>
                          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{product.score.total}</p>
                          <button
                            onClick={() => removeFromComparison(product.product.barcode)}
                            className="mt-2 text-xs text-red-500 hover:underline"
                          >
                            Fjern
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400">
                          <Plus className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Velg produkt</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Product list to choose from */}
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Velg fra historikk:</p>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {recentScans.map(result => (
                    <button
                      key={result.product.barcode}
                      onClick={() => addToComparison(result)}
                      disabled={compareProducts.some(p => p.product.barcode === result.product.barcode) || compareProducts.length >= 2}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {result.product.imageUrl ? (
                          <img src={result.product.imageUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Leaf className="w-5 h-5 text-gray-400 m-2.5" />
                        )}
                      </div>
                      <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 truncate">{result.product.name}</span>
                      <div className={`w-8 h-8 ${getScoreColor(result.score.total)} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{result.score.grade}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kontakt oss</h2>
                <button onClick={() => setShowContact(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Har du spørsmål, tilbakemeldinger eller forslag? Vi vil gjerne høre fra deg!
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:hei@gronnvalg.no"
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">E-post</p>
                    <p className="text-sm text-gray-500">hei@gronnvalg.no</p>
                  </div>
                </a>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>Om GrønnValg:</strong> Vi er et norsk team som ønsker å gjøre det enkelt å ta bærekraftige valg i hverdagen. Appen er gratis og samler ikke inn personlige data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowChat(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">GrønnHjelper</h2>
                  <p className="text-xs text-gray-500">AI-assistent for grønnere valg</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-green-200 dark:text-green-800 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Hei! Jeg kan hjelpe deg med å finne grønnere produkter. Prøv å spørre:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Hva er det grønneste brødet?',
                      'Hvordan fungerer GrønnScore?',
                      'Tips for norske produkter'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setChatInput(suggestion);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-green-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Skriv en melding..."
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim()}
                  className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
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
          onClose={closeResult}
        />
      )}
    </main>
  );
}
