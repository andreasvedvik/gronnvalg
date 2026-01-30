'use client';

import { History, Leaf, ChevronRight, Plus, ArrowLeftRight } from 'lucide-react';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor } from '@/lib/scoring';

interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  timestamp?: number;
}

interface ScanHistoryProps {
  recentScans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onAddToShoppingList: (product: ProductData) => void;
  onAddToComparison: (scan: ScanResult) => void;
  onClearHistory: () => void;
  compareCount: number;
}

export default function ScanHistory({
  recentScans,
  onSelectScan,
  onAddToShoppingList,
  onAddToComparison,
  onClearHistory,
  compareCount,
}: ScanHistoryProps) {
  if (recentScans.length === 0) return null;

  return (
    <div className="px-6 pb-6 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-overline text-gray-400 dark:text-gray-500 flex items-center gap-2">
          <History className="w-4 h-4" />
          Skannehistorikk ({recentScans.length})
        </h3>
        <button
          onClick={onClearHistory}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Slett alt
        </button>
      </div>
      <div className="space-y-3">
        {recentScans.slice(0, 10).map((result) => (
          <div
            key={result.product.barcode}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 card-hover text-left group"
          >
            <button
              onClick={() => onSelectScan(result)}
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
                onClick={() => onAddToShoppingList(result.product)}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                title="Legg til handleliste"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAddToComparison(result)}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Sammenlign"
                disabled={compareCount >= 2}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
