'use client';

import { X, ShoppingCart, Plus, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  barcode?: string;
}

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  onAddItem: (name: string) => void;
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
  const [newItem, setNewItem] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Handleliste
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Add item input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Legg til vare..."
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Shopping list items */}
          {items.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Handlelisten er tom. Legg til varer ovenfor eller fra skannede produkter.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <button
                    onClick={() => onToggleItem(item.id)}
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
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between text-sm text-gray-500">
              <span>{items.filter(i => i.checked).length} av {items.length} fullført</span>
              <button
                onClick={onClearCompleted}
                className="text-green-600 hover:underline"
              >
                Fjern fullførte
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
