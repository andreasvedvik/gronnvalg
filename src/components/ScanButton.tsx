'use client'

import { Scan } from 'lucide-react'

interface ScanButtonProps {
  onClick: () => void
}

export default function ScanButton({ onClick }: ScanButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-dashed border-gronn-300 hover:border-gronn-500 transition-colors group"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="bg-gronn-100 p-4 rounded-full group-hover:bg-gronn-200 transition-colors">
          <Scan className="w-12 h-12 text-gronn-600" />
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800">Skann et produkt</p>
          <p className="text-gray-500 mt-1">Se bærekraft- og næringsinfo</p>
        </div>
      </div>
    </button>
  )
}
