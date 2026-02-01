'use client';

import { TrendingUp, HelpCircle, ArrowLeftRight, Leaf, Target, Award } from 'lucide-react';
import { getScoreColor, getScoreTextColor } from '@/lib/scoring';
import { useLanguage } from '@/lib/i18n';

interface StatsCardProps {
  averageScore: number;
  scanCount: number;
  onShowScoreInfo: () => void;
  onShowComparison: () => void;
  showCompareButton: boolean;
}

// Circular Progress Ring Component
function CircularProgress({ score, size = 120, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Get gradient colors based on score
  const getGradientId = () => {
    if (score >= 60) return 'greenGradient';
    if (score >= 40) return 'yellowGradient';
    return 'redGradient';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreTextColor(score)}`}>
          {score}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">av 100</span>
      </div>
    </div>
  );
}

// Get grade letter based on score
function getGradeLetter(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'E';
}

// Get simple score description
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
  const { t, language } = useLanguage();
  const scoreDescription = getScoreDescription(averageScore, t);
  const gradeLetter = getGradeLetter(averageScore);

  return (
    <div className="mx-6 mb-6 animate-fade-in-up stagger-2">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 gap-3">

        {/* Main Score Card - Takes full width on top */}
        <div className="col-span-2 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-5">
            {/* Circular Progress */}
            <CircularProgress score={averageScore} size={100} strokeWidth={8} />

            {/* Score Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
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

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(averageScore)} text-white`}>
                  {gradeLetter}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {scoreDescription}
                </span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Target className="w-4 h-4" />
                <span>{t.basedOnScans.replace('{count}', String(scanCount))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Left */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              {language === 'nb' ? 'Skann' : 'Scans'}
            </span>
          </div>
          <span className="text-2xl font-bold text-green-700 dark:text-green-400">
            {scanCount}
          </span>
          <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-1">
            {language === 'nb' ? 'produkter skannet' : 'products scanned'}
          </p>
        </div>

        {/* Quick Stats - Right */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {language === 'nb' ? 'Nivå' : 'Level'}
            </span>
          </div>
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {scanCount < 5 ? '🌱' : scanCount < 15 ? '🌿' : scanCount < 30 ? '🌳' : '🏆'}
          </span>
          <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-1">
            {scanCount < 5 ? (language === 'nb' ? 'Nybegynner' : 'Beginner') :
             scanCount < 15 ? (language === 'nb' ? 'Utforsker' : 'Explorer') :
             scanCount < 30 ? (language === 'nb' ? 'Miljøvenn' : 'Eco Friend') :
             (language === 'nb' ? 'Miljøhelt' : 'Eco Hero')}
          </p>
        </div>

        {/* Comparison Button - Full width */}
        {showCompareButton && (
          <button
            onClick={onShowComparison}
            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 text-sm text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {t.compareProducts}
          </button>
        )}
      </div>
    </div>
  );
}
