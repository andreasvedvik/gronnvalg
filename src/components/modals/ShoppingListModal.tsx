'use client';

import { X, ShoppingCart, Plus, Check, Trash2, Search, Loader2, Share2, Download } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { ProductData } from '@/lib/openfoodfacts';
import { useLanguage } from '@/lib/i18n';

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
  imageUrl?: string;
}

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  onAddItem: (name: string, barcode?: string, imageUrl?: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
}

export default function ShoppingListModal({
  isOpen,
  onClose,
  items,
  onAddItem,
  onToggleItem,
  onRemoveItem,
  onClearCompleted,
}: ShoppingListModalProps) {
  const { t } = useLanguage();
  const [newItem, setNewItem] = useState('');
  const [searchResults, setSearchResults] = useState<ProductData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search
  useEffect(() => {
    if (newItem.length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Use API route - searches Kassalapp (Norwegian stores) + Open Food Facts
        const response = await fetch(`/api/search?q=${encodeURIComponent(newItem)}&limit=15`);
        const data = await response.json();
        setSearchResults(data.products || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [newItem]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  // Export shopping list
  const handleExport = async () => {
    const uncheckedItems = items.filter(i => !i.checked);
    const checkedItems = items.filter(i => i.checked);

    let text = '🛒 Handleliste fra Grønnest\n\n';

    if (uncheckedItems.length > 0) {
      text += '📝 Å handle:\n';
      uncheckedItems.forEach(item => {
        text += `• ${item.name}\n`;
      });
    }

    if (checkedItems.length > 0) {
      text += '\n✅ Handlet:\n';
      checkedItems.forEach(item => {
        text += `• ${item.name}\n`;
      });
    }

    text += '\n---\nLaget med Grønnest - Finn det grønneste valget!';

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Handleliste',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert(t.copiedToClipboard || 'Kopiert til utklippstavle!');
      }
    } catch (err) {
      console.log('Export failed:', err);
    }
  };

  const handleSelectProduct = (product: ProductData) => {
    onAddItem(product.name, product.barcode, product.imageUrl);
    setNewItem('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t.shoppingList}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Add item input with search */}
          <div className="relative mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                  placeholder={t.searchOrAddItem}
                  className="w-full px-4 py-2 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Search suggestions dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-12 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.barcode}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {product.brand}
                        {product.isNorwegian && ' 🇳🇴'}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </button>
                ))}

                {/* Option to add custom item */}
                <button
                  onClick={handleAdd}
                  className="w-full flex items-center gap-3 p-3 hover:bg-green-50 dark:hover:bg-green-900/20 text-left text-green-600"
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">
                    {t.addItem} "{newItem}" {t.addCustomItem}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Click outside to close suggestions */}
          {showSuggestions && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowSuggestions(false)}
            />
          )}

          {/* Shopping list items */}
          {items.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t.shoppingListEmpty}
            </p>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      item.checked
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {item.checked && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {/* Show product image if available */}
                  {item.imageUrl && (
                    <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <span className={`flex-1 min-w-0 truncate ${item.checked ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.name}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>{items.filter(i => i.checked).length} / {items.length} {t.itemsCompleted}</span>
                <button
                  onClick={onClearCompleted}
                  className="text-green-600 hover:underline"
                >
                  {t.removeCompleted}
                </button>
              </div>
              <button
                onClick={handleExport}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {t.exportList || 'Del handleliste'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
