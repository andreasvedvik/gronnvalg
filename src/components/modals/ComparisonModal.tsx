'use client';

import { X, ArrowLeftRight, Plus, Leaf, Tag } from 'lucide-react';
import Image from 'next/image';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor } from '@/lib/scoring';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLanguage } from '@/lib/i18n';

interface StorePriceInfo {
  price: number;
  unitPrice?: number;
  storeName: string;
  storeLogo?: string;
}

interface ScanResult {
  product: ProductData;
  score: GrønnScoreResult;
  alternatives: ProductData[];
  prices?: StorePriceInfo[];
  timestamp?: number;
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareProducts: ScanResult[];
  recentScans: ScanResult[];
  onAddToComparison: (result: ScanResult) => void;
  onRemoveFromComparison: (barcode: string) => void;
}

export default function ComparisonModal({
  isOpen,
  onClose,
  compareProducts,
  recentScans,
  onAddToComparison,
  onRemoveFromComparison,
}: ComparisonModalProps) {
  const { t, language } = useLanguage();
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const texts = {
    nb: {
      title: 'Sammenlign produkter',
      description: 'Velg opptil 2 produkter fra historikken for å sammenligne',
      remove: 'Fjern',
      selectProduct: 'Velg produkt',
      selectFromHistory: 'Velg fra historikk:',
      lowestPrice: 'Laveste pris',
      noPrice: 'Pris ukjent',
      winner: 'Beste valg!',
      betterScore: 'Bedre score',
      betterPrice: 'Bedre pris',
    },
    en: {
      title: 'Compare products',
      description: 'Select up to 2 products from history to compare',
      remove: 'Remove',
      selectProduct: 'Select product',
      selectFromHistory: 'Select from history:',
      lowestPrice: 'Lowest price',
      noPrice: 'Price unknown',
      winner: 'Best choice!',
      betterScore: 'Better score',
      betterPrice: 'Better price',
    },
  };

  const tx = texts[language] || texts.nb;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div ref={focusTrapRef} role="dialog" aria-modal="true" aria-labelledby="comparison-title" className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="comparison-title" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              {tx.title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {tx.description}
          </p>

          {/* Selected products for comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[0, 1].map((index) => {
              const product = compareProducts[index];
              return (
                <div key={index} className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl min-h-[200px] flex flex-col items-center justify-center">
                  {product ? (
                    <div className="text-center w-full">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative">
                        {product.product.imageUrl ? (
                          <Image src={product.product.imageUrl} alt={product.product.name} fill sizes="64px" className="object-contain" />
                        ) : (
                          <Leaf className="w-8 h-8 text-gray-400 m-4" />
                        )}
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.product.name}</p>
                      <div className={`mt-2 w-12 h-12 ${getScoreColor(product.score.total)} rounded-xl flex items-center justify-center mx-auto`}>
                        <span className="text-white font-bold text-lg">{product.score.grade}</span>
                      </div>
                      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{product.score.total}</p>

                      {/* Price display */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400">
                          <Tag className="w-3 h-3" />
                          <span className="text-xs">{tx.lowestPrice}</span>
                        </div>
                        {product.prices && product.prices.length > 0 ? (
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {product.prices[0].price.toFixed(2)} kr
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">{tx.noPrice}</p>
                        )}
                      </div>

                      <button
                        onClick={() => onRemoveFromComparison(product.product.barcode)}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        {tx.remove}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{tx.selectProduct}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison Summary - show when both products selected */}
          {compareProducts.length === 2 && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                {/* Score comparison */}
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    compareProducts[0].score.total > compareProducts[1].score.total
                      ? 'bg-green-500 text-white'
                      : compareProducts[0].score.total < compareProducts[1].score.total
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {compareProducts[0].score.total > compareProducts[1].score.total ? tx.betterScore :
                     compareProducts[0].score.total === compareProducts[1].score.total ? '=' : ''}
                  </span>
                </div>
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    compareProducts[1].score.total > compareProducts[0].score.total
                      ? 'bg-green-500 text-white'
                      : compareProducts[1].score.total < compareProducts[0].score.total
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {compareProducts[1].score.total > compareProducts[0].score.total ? tx.betterScore :
                     compareProducts[1].score.total === compareProducts[0].score.total ? '=' : ''}
                  </span>
                </div>

                {/* Price comparison */}
                {compareProducts[0].prices?.[0] && compareProducts[1].prices?.[0] && (
                  <>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        compareProducts[0].prices[0].price < compareProducts[1].prices[0].price
                          ? 'bg-blue-500 text-white'
                          : compareProducts[0].prices[0].price > compareProducts[1].prices[0].price
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            : 'bg-yellow-400 text-yellow-900'
                      }`}>
                        {compareProducts[0].prices[0].price < compareProducts[1].prices[0].price ? tx.betterPrice :
                         compareProducts[0].prices[0].price === compareProducts[1].prices[0].price ? '=' : ''}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        compareProducts[1].prices[0].price < compareProducts[0].prices[0].price
                          ? 'bg-blue-500 text-white'
                          : compareProducts[1].prices[0].price > compareProducts[0].prices[0].price
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            : 'bg-yellow-400 text-yellow-900'
                      }`}>
                        {compareProducts[1].prices[0].price < compareProducts[0].prices[0].price ? tx.betterPrice :
                         compareProducts[1].prices[0].price === compareProducts[0].prices[0].price ? '=' : ''}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Product list to choose from */}
          <div className="border-t dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{tx.selectFromHistory}</p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {recentScans.map(result => (
                <button
                  key={result.product.barcode}
                  onClick={() => onAddToComparison(result)}
                  disabled={compareProducts.some(p => p.product.barcode === result.product.barcode) || compareProducts.length >= 2}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {result.product.imageUrl ? (
                      <Image src={result.product.imageUrl} alt={result.product.name} fill sizes="40px" className="object-contain" />
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
  );
}
