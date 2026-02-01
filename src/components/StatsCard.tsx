'use client';

import { TrendingUp, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { getScoreColor, getScoreTextColor } from '@/lib/scoring';
import { useLanguage } from '@/lib/i18n';

interface StatsCardProps {
  averageScore: number;
  scanCount: number;
  onShowScoreInfo: () => void;
  onShowComparison: () => void;
  showCompareButton: boolean;
}

// Get simple score description for accessibility
function getScoreDescription(score: number, t: ReturnType<typeof useLanguage>['t']): string {
  if (score >= 80) return t.scoreExcellent;
  if (score >= 60) return t.scoreGood;
  if (score >= 40) return t.scoreAverage;
  if (score >= 20) return t.scoreNeedsImprovement;
  return t.scorePoor;
}

export default function StatsCard({
  averageScore,
  scanCount,
  onShowScoreInfo,
  onShowComparison,
  showCompareButton,
}: StatsCardProps) {
  const { t } = useLanguage();
  const scoreDescription = getScoreDescription(averageScore, t);

  return (
    <div className="mx-6 mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up stagger-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-caption text-gray-600 dark:text-gray-400">
            {t.yourAverageScore}
          </span>
          <button
            onClick={onShowScoreInfo}
            className="text-gray-400 hover:text-green-500 transition-colors"
            aria-label={t.whatIsMiljoscore}
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
        <span className={`ml-2 mb-1 px-2 py-0.5 text-sm font-semibold rounded-full ${getScoreColor(averageScore)} text-white`}>
          {scoreDescription}
        </span>
        <span className="ml-auto text-caption text-gray-500 dark:text-gray-400">
          {t.basedOnScans.replace('{count}', String(scanCount))}
        </span>
      </div>
      <div className="mt-4 h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-green-900/30 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            averageScore >= 60 ? 'bg-gradient-to-r from-green-400 to-green-500' :
            averageScore >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
            'bg-gradient-to-r from-red-400 to-orange-500'
          }`}
          style={{ width: `${averageScore}%` }}
        />
        {/* Score indicator dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-900 rounded-full shadow-md border-2 border-current transition-all duration-700"
          style={{
            left: `calc(${averageScore}% - 8px)`,
            borderColor: averageScore >= 60 ? '#22c55e' : averageScore >= 40 ? '#eab308' : '#ef4444'
          }}
        />
      </div>

      {/* Comparison Button */}
      {showCompareButton && (
        <button
          onClick={onShowComparison}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          {t.compareProducts}
        </button>
      )}
    </div>
  );
}
