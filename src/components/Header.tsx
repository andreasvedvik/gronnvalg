'use client'

import { Leaf } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gronn-600 to-gronn-700 text-white p-6 rounded-b-3xl shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white/20 p-2 rounded-xl">
          <Leaf className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">GrønnValg</h1>
          <p className="text-gronn-100 text-sm">Helse + Bærekraft i én app</p>
        </div>
      </div>
    </header>
  )
}
