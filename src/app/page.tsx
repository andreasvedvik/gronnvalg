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
  ChevronRight
} from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductCard from '@/components/ProductCard';
import { fetchProduct, searchAlternatives, ProductData } from '@/lib/openfoodfacts';
import { calculateGrønnScore, GrønnScoreResult, getScoreColor, getScoreTextColor } from '@/lib/scoring';

interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
}

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      }

      const result: ScanResult = { product, score, alternatives };
      setScanResult(result);
      setShowScanner(false);

      setRecentScans((prev) => {
        const filtered = prev.filter((r) => r.product.barcode !== barcode);
        return [result, ...filtered].slice(0, 10);
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

  const averageScore =
    recentScans.length > 0
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
          <button className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95">
            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </header>

      {/* Stats Card */}
      {recentScans.length > 0 && (
        <div className="mx-6 mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption text-gray-600 dark:text-gray-400">
              Din gjennomsnittlige GrønnScore
            </span>
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

        <p className="text-caption text-gray-400 dark:text-gray-500 mt-5">
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

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="px-6 pb-6 animate-fade-in-up stagger-4">
          <h3 className="text-overline text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
            <History className="w-4 h-4" />
            Nylig skannet
          </h3>
          <div className="space-y-3">
            {recentScans.slice(0, 5).map((result, i) => (
              <button
                key={result.product.barcode}
                onClick={() => setScanResult(result)}
                className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 card-hover text-left group"
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
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="px-6 pb-8 animate-fade-in-up stagger-5">
        <h3 className="text-overline text-gray-400 dark:text-gray-500 mb-4">
          Slik fungerer det
        </h3>
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

      {/* Footer */}
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
      </footer>

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
