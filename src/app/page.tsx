'use client';

import { useState } from 'react';
import { Scan, Search, User, Leaf, TrendingUp, History } from 'lucide-react';
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
        // Filter out the current product
        alternatives = alternatives.filter((a) => a.barcode !== product.barcode);
      }

      const result: ScanResult = { product, score, alternatives };
      setScanResult(result);
      setShowScanner(false);

      // Add to recent scans (keep last 10)
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

  // Calculate average score from recent scans
  const averageScore =
    recentScans.length > 0
      ? Math.round(recentScans.reduce((sum, r) => sum + r.score.total, 0) / recentScans.length)
      : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              GrønnValg
              <Leaf className="w-6 h-6 text-green-500" />
            </h1>
            <p className="text-gray-500 text-sm">Velg grønnere, lev bedre</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      {recentScans.length > 0 && (
        <div className="mx-6 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Din gjennomsnittlige GrønnScore</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${getScoreTextColor(averageScore)}`}>
              {averageScore}
            </span>
            <span className="text-gray-400 mb-1">/100</span>
            <span className="ml-auto text-sm text-gray-500">
              Basert på {recentScans.length} skann
            </span>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreColor(averageScore)} rounded-full transition-all duration-500`}
              style={{ width: `${averageScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Welcome Card (shown when no scans yet) */}
      {recentScans.length === 0 && (
        <div className="mx-6 mb-6 p-6 bg-white rounded-2xl shadow-sm border border-green-100">
          <div className="text-center">
            <div className="text-4xl mb-3">🌱</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Velkommen til GrønnValg!</h2>
            <p className="text-gray-500 text-sm">
              Skann produkter for å se bærekraft-score og finne grønnere norske alternativer.
            </p>
          </div>
        </div>
      )}

      {/* Main Scan Button */}
      <div className="flex flex-col items-center justify-center px-6 py-8">
        <button
          onClick={() => setShowScanner(true)}
          className="w-40 h-40 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <Scan className="w-16 h-16 text-white mb-2" />
          <span className="text-white font-semibold">Skann produkt</span>
        </button>
        <p className="text-gray-400 text-sm mt-4">Trykk for å skanne en strekkode</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 text-sm font-medium hover:underline"
          >
            Lukk
          </button>
        </div>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            NYLIG SKANNET
          </h3>
          <div className="space-y-2">
            {recentScans.slice(0, 5).map((result, i) => (
              <button
                key={result.product.barcode}
                onClick={() => setScanResult(result)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {result.product.imageUrl ? (
                    <img
                      src={result.product.imageUrl}
                      alt={result.product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{result.product.name}</p>
                  <p className="text-xs text-gray-500 truncate">{result.product.brand}</p>
                </div>
                <div
                  className={`w-10 h-10 ${getScoreColor(result.score.total)} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-bold">{result.score.grade}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="px-6 pb-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">HVORDAN DET FUNGERER</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
            <div className="text-2xl mb-2">📸</div>
            <p className="text-xs text-gray-600">Skann strekkode</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
            <div className="text-2xl mb-2">🌱</div>
            <p className="text-xs text-gray-600">Se GrønnScore</p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
            <div className="text-2xl mb-2">🇳🇴</div>
            <p className="text-xs text-gray-600">Finn alternativer</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Data fra{' '}
          <a
            href="https://openfoodfacts.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            Open Food Facts
          </a>
        </p>
        <p className="text-xs text-gray-400 mt-1">GrønnValg © 2026</p>
      </div>

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
