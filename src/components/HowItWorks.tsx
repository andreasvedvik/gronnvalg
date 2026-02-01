'use client';

import { Camera, Sparkles, MapPin, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface HowItWorksProps {
  onShowScoreInfo: () => void;
}

export default function HowItWorks({ onShowScoreInfo }: HowItWorksProps) {
  const { t } = useLanguage();

  return (
    <div className="px-6 pb-8 animate-fade-in-up stagger-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-overline text-gray-400 dark:text-gray-500">
          {t.howItWorks}
        </h3>
        <button
          onClick={onShowScoreInfo}
          className="text-xs text-green-600 dark:text-green-400 font-medium hover:underline flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          {t.gronnScore}?
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 group">
          <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t.step1Title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.step1Description}</p>
        </div>
        <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 group">
          <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t.gronnScore}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.step2Description}</p>
        </div>
        <div className="text-center p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 group">
          <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t.step3Title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.step3Description}</p>
        </div>
      </div>
    </div>
  );
}
