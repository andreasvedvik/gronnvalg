'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { ProductData } from '@/lib/openfoodfacts'
import { calculateGrønnScore, getScoreColor } from '@/lib/scoring'

interface SearchBarProps {
  searchQuery: string
  searchResults: ProductData[]
  isSearching: boolean
  showSearchResults: boolean
  onSearch: (query: string) => void
  onSelectResult: (product: ProductData) => void
  onClear: () => void
}

const DEBOUNCE_DELAY = 300 // milliseconds

export default function SearchBar({
  searchQuery,
  searchResults,
  isSearching,
  showSearchResults,
  onSearch,
  onSelectResult,
  onClear,
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sync localQuery with searchQuery when it changes externally (e.g., on clear)
  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Only search if query has changed and is different from parent state
    if (localQuery !== searchQuery) {
      debounceRef.current = setTimeout(() => {
        onSearch(localQuery)
      }, DEBOUNCE_DELAY)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [localQuery, searchQuery, onSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
  }

  const handleClear = () => {
    setLocalQuery('')
    onClear()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          placeholder="Søk etter produkt..."
          className="w-full pl-12 pr-10 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 dark:text-white placeholder-gray-400"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            aria-label="Tøm søkefelt"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-80 overflow-auto z-50">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 p-6 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Søker...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((item) => {
                const score = calculateGrønnScore(item)
                return (
                  <button
                    key={item.barcode}
                    onClick={() => onSelectResult(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getScoreColor(score.total)}`}>
                      {score.grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.brand || 'Ukjent merke'}</p>
                    </div>
                    {item.isNorwegian && (
                      <span className="text-lg">🇳🇴</span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <p>Ingen produkter funnet for "{searchQuery}"</p>
              <p className="text-sm mt-1">Prøv å søke på noe annet</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
