'use client';

import { Filter, ChevronDown } from 'lucide-react';

interface Filters {
  norwegianOnly: boolean;
  organic: boolean;
}

interface FilterBarProps {
  filters: Filters;
  showFilters: boolean;
  onToggleFilters: () => void;
  onFilterChange: (filters: Filters) => void;
}

export default function FilterBar({
  filters,
  showFilters,
  onToggleFilters,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="px-6 mb-4 animate-fade-in-up stagger-2">
      <button
        onClick={onToggleFilters}
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
                onChange={(e) => onFilterChange({ ...filters, norwegianOnly: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">🇳🇴 Kun norske produkter</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.organic}
                onChange={(e) => onFilterChange({ ...filters, organic: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">🌱 Kun økologisk</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
