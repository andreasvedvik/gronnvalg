'use client';

import { TrendingUp, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { getScoreColor, getScoreTextColor } from '@/lib/scoring';

interface StatsCardProps {
  averageScore: number;
  scanCount: number;
  onShowScoreInfo: () => void;
  onShowComparison: () => void;
  showCompareButton: boolean;
}

export default function StatsCard({
  averageScore,
  scanCount,
  onShowScoreInfo,
  onShowComparison,
  showCompareButton,
}: StatsCardProps) {
  return (
    <div className="mx-6 mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up stagger-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-caption text-gray-600 dark:text-gray-400">
            Din gjennomsnittlige GrønnScore
          </span>
          <button
            onClick={onShowScoreInfo}
            className="text-gray-400 hover:text-green-500 transition-colors"
            aria-label="Hva er GrønnScore?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-extrabold tracking-tight ${getScoreTextColor(averageScore)}`}>
          {averageScore}
        </span>
        <span className="text-gray-400 dark:text-gray-500 mb-1 font-medium">/100</span>
        <span className="ml-auto text-caption text-gray-500 dark:text-gray-400">
          Basert på {scanCount} skann
        </span>
      </div>
      <div className="mt-4 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreColor(averageScore)} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${averageScore}%` }}
        />
      </div>

      {/* Comparison Button */}
      {showCompareButton && (
        <button
          onClick={onShowComparison}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Sammenlign produkter
        </button>
      )}
    </div>
  );
}
