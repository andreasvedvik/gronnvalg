'use client'

import { Search, Loader2, X } from 'lucide-react'
import { ProductData } from '@/lib/openfoodfacts'
import { getCombinedScore } from '@/lib/scoring'

interface SearchBarProps {
  searchQuery: string
  searchResults: ProductData[]
  isSearching: boolean
  showSearchResults: boolean
  onSearch: (query: string) => void
  onSelectResult: (product: ProductData) => void
  onClear: () => void
}

export default function SearchBar({
  searchQuery,
  searchResults,
  isSearching,
  showSearchResults,
  onSearch,
  onSelectResult,
  onClear,
}: SearchBarProps) {
  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-gronn-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Søk etter produkt..."
          className="w-full pl-12 pr-10 py-4 bg-white rounded-2xl shadow-lg border border-gray-100 focus:border-gronn-500 focus:ring-2 focus:ring-gronn-200 outline-none text-gray-800 placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-80 overflow-auto z-50">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 p-6 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Søker...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((item) => {
                const combinedScore = getCombinedScore(item.grpiScore, item.healthScore)
                return (
                  <button
                    key={item.barcode}
                    onClick={() => onSelectResult(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gronn-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getScoreBg(combinedScore)}`}>
                      {combinedScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">{item.brand || 'Ukjent merke'}</p>
                    </div>
                    {item.isNorwegian && (
                      <span className="text-lg">🇳🇴</span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Ingen produkter funnet for "{searchQuery}"</p>
              <p className="text-sm mt-1">Prøv å søke på noe annet</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
