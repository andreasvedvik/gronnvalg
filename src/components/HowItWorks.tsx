'use client';

import { Camera, Sparkles, MapPin, Info } from 'lucide-react';

interface HowItWorksProps {
  onShowScoreInfo: () => void;
}

export default function HowItWorks({ onShowScoreInfo }: HowItWorksProps) {
  return (
    <div className="px-6 pb-8 animate-fade-in-up stagger-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-overline text-gray-400 dark:text-gray-500">
          Slik fungerer det
        </h3>
        <button
          onClick={onShowScoreInfo}
          className="text-xs text-green-600 dark:text-green-400 font-medium hover:underline flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          Hva er GrønnScore?
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-caption font-medium text-gray-700 dark:text-gray-300">Skann strekkode</p>
        </div>
        <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-caption font-medium text-gray-700 dark:text-gray-300">Se GrønnScore</p>
        </div>
        <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 card-hover">
          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-caption font-medium text-gray-700 dark:text-gray-300">Finn alternativer</p>
        </div>
      </div>
    </div>
  );
}
