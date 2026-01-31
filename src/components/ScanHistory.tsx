'use client';

import { memo, useCallback } from 'react';
import { History, Leaf, ChevronRight, Plus, ArrowLeftRight, Share2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor } from '@/lib/scoring';

interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  timestamp?: number;
}

interface ScanHistoryItemProps {
  result: ScanResult;
  onSelect: () => void;
  onAddToShoppingList: () => void;
  onAddToComparison: () => void;
  compareDisabled: boolean;
}

// Memoized list item component - only re-renders when its specific data changes
const ScanHistoryItem = memo(function ScanHistoryItem({
  result,
  onSelect,
  onAddToShoppingList,
  onAddToComparison,
  compareDisabled,
}: ScanHistoryItemProps) {
  return (
    <div className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 card-hover text-left group">
      <button
        onClick={onSelect}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          {result.product.imageUrl ? (
            <img
              src={result.product.imageUrl}
              alt={result.product.name}
              className="w-full h-full object-contain"
              loading="lazy"
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
          onClick={onAddToShoppingList}
          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
          title="Legg til handleliste"
          aria-label="Legg til handleliste"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onAddToComparison}
          className="p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          title="Sammenlign"
          aria-label="Sammenlign"
          disabled={compareDisabled}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors" />
    </div>
  );
});

interface ScanHistoryProps {
  recentScans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onAddToShoppingList: (product: ProductData) => void;
  onAddToComparison: (scan: ScanResult) => void;
  onClearHistory: () => void;
  compareCount: number;
}

// Memoized main component
const ScanHistory = memo(function ScanHistory({
  recentScans,
  onSelectScan,
  onAddToShoppingList,
  onAddToComparison,
  onClearHistory,
  compareCount,
}: ScanHistoryProps) {
  const { t, language } = useLanguage();

  const handleExport = useCallback(async () => {
    const header = language === 'nb'
      ? '📊 Skannehistorikk fra Grønnest\n\n'
      : '📊 Scan History from Grønnest\n\n';

    let text = header;
    recentScans.slice(0, 10).forEach((result, index) => {
      const date = result.timestamp
        ? new Date(result.timestamp).toLocaleDateString(language === 'nb' ? 'nb-NO' : 'en-US')
        : '';
      text += `${index + 1}. ${result.product.name}`;
      if (result.product.brand) text += ` (${result.product.brand})`;
      text += ` - ${language === 'nb' ? 'Score' : 'Score'}: ${result.score.grade} (${result.score.total}/100)`;
      if (date) text += ` - ${date}`;
      text += '\n';
    });

    text += language === 'nb'
      ? '\n🌱 Skann produkter på gronnest.vercel.app'
      : '\n🌱 Scan products at gronnest.vercel.app';

    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'nb' ? 'Skannehistorikk' : 'Scan History',
          text: text,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(text);
        }
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [recentScans, language]);

  if (recentScans.length === 0) return null;

  const compareDisabled = compareCount >= 2;

  return (
    <div className="px-6 pb-6 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-overline text-gray-400 dark:text-gray-500 flex items-center gap-2">
          <History className="w-4 h-4" />
          {t.scanHistory} ({recentScans.length})
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="text-xs text-gray-400 hover:text-green-500 transition-colors flex items-center gap-1"
            title={t.exportHistory}
          >
            <Share2 className="w-3 h-3" />
            {t.export}
          </button>
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {t.clearAll}
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {recentScans.slice(0, 10).map((result) => (
          <ScanHistoryItem
            key={result.product.barcode}
            result={result}
            onSelect={() => onSelectScan(result)}
            onAddToShoppingList={() => onAddToShoppingList(result.product)}
            onAddToComparison={() => onAddToComparison(result)}
            compareDisabled={compareDisabled}
          />
        ))}
      </div>
    </div>
  );
});

export default ScanHistory;
