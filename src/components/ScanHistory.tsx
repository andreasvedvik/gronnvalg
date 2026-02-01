'use client';

import { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import { History, Leaf, ChevronRight, Plus, ArrowLeftRight, Share2, Heart, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor } from '@/lib/scoring';
import Tooltip from '@/components/Tooltip';

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
  onToggleFavorite: () => void;
  isFavorite: boolean;
  compareDisabled: boolean;
  addToListLabel: string;
  compareLabel: string;
  favoriteLabel: string;
}

// Memoized list item component - only re-renders when its specific data changes
const ScanHistoryItem = memo(function ScanHistoryItem({
  result,
  onSelect,
  onAddToShoppingList,
  onAddToComparison,
  onToggleFavorite,
  isFavorite,
  compareDisabled,
  addToListLabel,
  compareLabel,
  favoriteLabel,
}: ScanHistoryItemProps) {
  const { language } = useLanguage();

  // Get grade description for tooltip
  const getGradeDescription = (grade: string, score: number) => {
    const descriptions: Record<string, { nb: string; en: string }> = {
      'A': { nb: 'Utmerket miljøvalg', en: 'Excellent eco choice' },
      'B': { nb: 'Godt miljøvalg', en: 'Good eco choice' },
      'C': { nb: 'Middels miljøvalg', en: 'Average eco choice' },
      'D': { nb: 'Mindre bra miljøvalg', en: 'Below average eco choice' },
      'E': { nb: 'Dårlig miljøvalg', en: 'Poor eco choice' },
    };
    const desc = descriptions[grade] || { nb: 'Ukjent', en: 'Unknown' };
    return `${grade}: ${language === 'nb' ? desc.nb : desc.en} (${score}/100)`;
  };

  return (
    <div className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 text-left group">
      {/* Favorite button - always visible */}
      <button
        onClick={onToggleFavorite}
        className={`p-2 rounded-full transition-colors flex-shrink-0 ${
          isFavorite
            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400'
        }`}
        title={favoriteLabel}
        aria-label={favoriteLabel}
      >
        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      <button
        onClick={onSelect}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative ring-1 ring-gray-100 dark:ring-gray-600">
          {result.product.imageUrl ? (
            <Image
              src={result.product.imageUrl}
              alt={result.product.name}
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          ) : (
            <Leaf className="w-6 h-6 text-gray-300 dark:text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
            {result.product.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {result.product.brand}
          </p>
        </div>
        <Tooltip content={getGradeDescription(result.score.grade, result.score.total)} position="left">
          <div
            className={`w-11 h-11 ${getScoreColor(result.score.total)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md hover:scale-105 transition-transform cursor-help`}
          >
            <span className="text-white font-bold text-lg">{result.score.grade}</span>
          </div>
        </Tooltip>
      </button>

      {/* Action buttons - visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onAddToShoppingList}
          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
          title={addToListLabel}
          aria-label={addToListLabel}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onAddToComparison}
          className="p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          title={compareLabel}
          aria-label={compareLabel}
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
  favoriteScans: ScanResult[];
  favorites: string[];
  onSelectScan: (scan: ScanResult) => void;
  onAddToShoppingList: (product: ProductData) => void;
  onAddToComparison: (scan: ScanResult) => void;
  onToggleFavorite: (barcode: string) => void;
  onClearHistory: () => void;
  compareCount: number;
}

// Memoized main component
const ScanHistory = memo(function ScanHistory({
  recentScans,
  favoriteScans,
  favorites,
  onSelectScan,
  onAddToShoppingList,
  onAddToComparison,
  onToggleFavorite,
  onClearHistory,
  compareCount,
}: ScanHistoryProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');

  const handleExport = useCallback(async () => {
    const scansToExport = activeTab === 'history' ? recentScans : favoriteScans;
    const header = language === 'nb'
      ? activeTab === 'history' ? '📊 Skannehistorikk fra Grønnest\n\n' : '❤️ Mine favoritter fra Grønnest\n\n'
      : activeTab === 'history' ? '📊 Scan History from Grønnest\n\n' : '❤️ My Favorites from Grønnest\n\n';

    let text = header;
    scansToExport.slice(0, 10).forEach((result, index) => {
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
          title: language === 'nb' ? (activeTab === 'history' ? 'Skannehistorikk' : 'Mine favoritter') : (activeTab === 'history' ? 'Scan History' : 'My Favorites'),
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
  }, [recentScans, favoriteScans, activeTab, language]);

  if (recentScans.length === 0) return null;

  const compareDisabled = compareCount >= 2;
  const addToListLabel = language === 'nb' ? 'Legg til handleliste' : 'Add to shopping list';
  const compareLabel = language === 'nb' ? 'Sammenlign' : 'Compare';
  const favoriteLabel = language === 'nb' ? 'Favoritt' : 'Favorite';

  const displayScans = activeTab === 'history' ? recentScans : favoriteScans;

  return (
    <div className="px-6 pb-6 animate-fade-in-up stagger-4">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'nb' ? 'Historikk' : 'History'}</span>
            <span className="text-xs text-gray-400">({recentScans.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-red-500' : ''}`} />
            <span className="hidden sm:inline">{language === 'nb' ? 'Favoritter' : 'Favorites'}</span>
            <span className="text-xs text-gray-400">({favoriteScans.length})</span>
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="text-xs text-gray-400 hover:text-green-500 transition-colors flex items-center gap-1"
            title={t.exportHistory}
          >
            <Share2 className="w-3 h-3" />
            <span className="hidden sm:inline">{t.export}</span>
          </button>
          {activeTab === 'history' && (
            <button
              onClick={onClearHistory}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              {t.clearAll}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {displayScans.length > 0 ? (
        <div className="space-y-3">
          {displayScans.slice(0, 10).map((result) => (
            <ScanHistoryItem
              key={result.product.barcode}
              result={result}
              onSelect={() => onSelectScan(result)}
              onAddToShoppingList={() => onAddToShoppingList(result.product)}
              onAddToComparison={() => onAddToComparison(result)}
              onToggleFavorite={() => onToggleFavorite(result.product.barcode)}
              isFavorite={favorites.includes(result.product.barcode)}
              compareDisabled={compareDisabled}
              addToListLabel={addToListLabel}
              compareLabel={compareLabel}
              favoriteLabel={favoriteLabel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {language === 'nb'
              ? 'Ingen favoritter ennå. Trykk på hjertet for å legge til!'
              : 'No favorites yet. Tap the heart to add some!'}
          </p>
        </div>
      )}
    </div>
  );
});

export default ScanHistory;
