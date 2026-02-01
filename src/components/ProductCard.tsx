'use client';

import { useState } from 'react';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor, getScoreTextColor } from '@/lib/scoring';
import { X, Leaf, Heart, Truck, Package, Award, Recycle, ChevronRight, ExternalLink, AlertCircle, HelpCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { getProductCertifications, CertificationInfo, formatLabelName, shouldHideLabel } from '@/lib/certifications';

// Circular Score Ring Component for Product Card
function ScoreRing({ score, size = 80, strokeWidth = 6, label, icon }: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  icon: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getGradientId = () => {
    if (score >= 60) return 'scoreGreen';
    if (score >= 40) return 'scoreYellow';
    return 'scoreRed';
  };

  // Get grade letter
  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'E';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="scoreGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="scoreYellow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="scoreRed" x1="0%" y1="0%" x2="100%" y2="0%">
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
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content - Grade letter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreTextColor(score)}`}>
            {grade}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{score}/100</span>
        </div>
      </div>

      {/* Label below */}
      <div className="flex items-center gap-1 mt-2">
        {icon}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: ProductData;
  score: GrønnScoreResult;
  onClose: () => void;
  onScanAgain?: () => void; // Callback to open scanner again (for mobile UX)
  alternatives?: ProductData[];
  similarProducts?: ProductData[]; // KUN norske produkter
  onSelectProduct?: (barcode: string) => void; // Callback for selecting a similar product
  isLoadingExtras?: boolean; // True while loading alternatives, similar products
}

export default function ProductCard({ product, score, onClose, onScanAgain, alternatives = [], similarProducts = [], onSelectProduct, isLoadingExtras = false }: ProductCardProps) {
  const { t, language } = useLanguage();
  const [showCertDetails, setShowCertDetails] = useState(false);

  // Share product function
  const handleShare = async () => {
    const shareText = language === 'nb'
      ? `${product.name} fra ${product.brand} har Miljøscore ${score.grade} (${score.total}/100) på Grønnest!`
      : `${product.name} from ${product.brand} has Eco Score ${score.grade} (${score.total}/100) on Grønnest!`;

    const shareData = {
      title: 'Grønnest',
      text: shareText,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        alert(language === 'nb' ? 'Kopiert til utklippstavle!' : 'Copied to clipboard!');
      }
    } catch {
      // Share failed silently
    }
  };

  // Get certification explanations for product labels
  const certifications = getProductCertifications(product.labels, product.labelTags || []);
  const hasCertifications = certifications.length > 0;

  // Kombiner alle norske produkter (fra alternatives og similarProducts)
  const norwegianProducts = [
    ...similarProducts,
    ...alternatives.filter(a => a.isNorwegian)
  ].filter((p, i, arr) =>
    // Fjern duplikater basert på barcode
    arr.findIndex(x => x.barcode === p.barcode) === i
  );
  const hasNorwegianProducts = norwegianProducts.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 z-10 rounded-t-3xl">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label={t.close}
            className="min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {product.brand} {product.origin && `• ${product.origin}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
            aria-label={t.export}
          >
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Product Hero - Redesigned with larger scores */}
        <div className="bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-6">
          {/* Product Image - Centered at top */}
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shadow-lg relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-5xl">📦</span>
              )}
              {product.isNorwegian && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border-2 border-green-100 dark:border-green-800">
                  <span className="text-lg">🇳🇴</span>
                </div>
              )}
            </div>
          </div>

          {/* Score Rings - Side by side */}
          <div className="flex justify-center gap-8">
            <ScoreRing
              score={score.total}
              size={90}
              strokeWidth={7}
              label={t.gronnScore}
              icon={<Leaf className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
            />
            <ScoreRing
              score={score.healthScore.total}
              size={90}
              strokeWidth={7}
              label={t.nutritionInfo}
              icon={<Heart className="w-3.5 h-3.5 text-red-500" />}
            />
          </div>

          {/* Labels/Certifications with explanations */}
          {(hasCertifications || product.labels.length > 0) && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {/* Show recognized certifications with icons */}
                {certifications.map((cert) => (
                  <span
                    key={cert.id}
                    className={`px-3 py-1.5 ${cert.color} rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setShowCertDetails(!showCertDetails)}
                  >
                    {cert.icon && <span>{cert.icon}</span>}
                    {language === 'nb' ? cert.name : cert.nameEn}
                  </span>
                ))}
                {/* Show unrecognized labels as generic badges (cleaned up) */}
                {product.labels
                  .filter(label =>
                    // Not already shown as a certification
                    !certifications.some(cert =>
                      label.toLowerCase().includes(cert.id) ||
                      label.toLowerCase().includes(cert.name.toLowerCase()) ||
                      label.toLowerCase().includes(cert.nameEn.toLowerCase())
                    ) &&
                    // Not in the hidden list
                    !shouldHideLabel(label)
                  )
                  .slice(0, 3)
                  .map((label, i) => (
                    <span
                      key={`label-${i}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      {formatLabelName(label)}
                    </span>
                  ))
                }
              </div>

              {/* Expandable certification details */}
              {hasCertifications && (
                <button
                  onClick={() => setShowCertDetails(!showCertDetails)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-2 font-medium"
                >
                  <Info className="w-3 h-3" />
                  {t.whatDoesThisMean}
                  {showCertDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {/* Certification explanations */}
              {showCertDetails && hasCertifications && (
                <div className="mt-3 space-y-2">
                  {certifications.map((cert) => (
                    <div
                      key={`detail-${cert.id}`}
                      className={`p-3 rounded-xl border ${cert.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-50 bg-')}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{cert.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {language === 'nb' ? cert.name : cert.nameEn}
                          </h4>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {language === 'nb' ? cert.description : cert.descriptionEn}
                          </p>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:underline mt-1 inline-flex items-center gap-1"
                            >
                              {t.learnMore}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Allergen Warning - Show prominently if allergens exist */}
        {(product.allergenInfo.hasAllergens || product.allergenInfo.hasTraces) && (
          <div className="mx-4 mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {t.allergenWarning}
            </h3>
            {product.allergenInfo.hasAllergens && (
              <div className="mb-2">
                <span className="text-sm font-medium text-amber-900">{t.contains}: </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {product.allergenInfo.allergens.map((allergen, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-medium"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.allergenInfo.hasTraces && (
              <div>
                <span className="text-sm font-medium text-amber-700">{t.mayContainTracesOf}: </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {product.allergenInfo.traces.map((trace, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
                    >
                      {trace}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Score Breakdown */}
        <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
              {t.whyThisScore}
            </h3>
            {/* Data Quality Indicator */}
            <div className="flex items-center gap-1.5" title={`${t.dataQuality}: ${score.dataQuality}%`}>
              <span className="text-xs text-gray-500 dark:text-gray-400">Data:</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3 rounded-sm ${
                      i < Math.ceil(score.dataQuality / 20)
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{score.dataQuality}%</span>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(score.breakdown).map(([key, data]) => (
              <div key={key} className={`flex items-center gap-3 ${!data.dataAvailable ? 'opacity-70' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm relative ${
                  data.dataAvailable ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600'
                }`}>
                  {key === 'transport' && <Truck className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                  {key === 'packaging' && <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                  {key === 'ecoscore' && <Recycle className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                  {key === 'norwegian' && <span className="text-sm">🇳🇴</span>}
                  {key === 'certifications' && <Award className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                  {!data.dataAvailable && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-yellow-900 font-bold">?</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{data.label}</span>
                      {!data.dataAvailable && (
                        <span title={`${t.dataNotAvailable} - ${t.estimatedValue}`}>
                          <HelpCircle className="w-3 h-3 text-yellow-500" />
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${data.dataAvailable ? getScoreTextColor(data.score) : 'text-gray-400 dark:text-gray-500'}`}>
                      {data.dataAvailable ? data.score : `~${data.score}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${data.dataAvailable ? getScoreColor(data.score) : 'bg-gray-400 dark:bg-gray-500'} rounded-full transition-all duration-500 ${
                        !data.dataAvailable ? 'opacity-50' : ''
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${data.dataAvailable ? 'text-gray-500 dark:text-gray-400' : 'text-yellow-600 dark:text-yellow-500 italic'}`}>
                    {data.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Low data quality warning */}
          {score.dataQuality < 50 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                {t.limitedData}. {t.limitedDataDescription}
              </p>
            </div>
          )}
        </div>

        {/* Ultra-processed Warning - Show prominently for NOVA 4 */}
        {product.novaGroup === 4 && (
          <div className="mx-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t.novaUltraProcessed}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {language === 'nb'
                    ? 'Dette produktet er ultrabearbeidet. Forskning viser at høyt inntak av ultrabearbeidet mat kan ha negative helseeffekter.'
                    : 'This product is ultra-processed. Research shows that high consumption of ultra-processed foods may have negative health effects.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Health Details - Bento style */}
        <div className="mx-4 mt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 px-1">
            <Heart className="w-4 h-4 text-red-500" />
            {t.healthInfo}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Nutri-Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800/30">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">{t.nutriScore}</div>
              <div className="text-[10px] text-blue-600/70 dark:text-blue-500/70 mb-2">{t.nutriScoreExplain}</div>
              <div className={`text-3xl font-bold ${getScoreTextColor(score.healthScore.total)}`}>
                {score.healthScore.nutriscore && !['unknown', 'not-applicable'].includes(score.healthScore.nutriscore.toLowerCase())
                  ? score.healthScore.nutriscore.toUpperCase()
                  : '?'}
              </div>
            </div>

            {/* NOVA Group Card */}
            <div className={`rounded-2xl p-4 border ${
              product.novaGroup === 4 ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800/30' :
              product.novaGroup === 3 ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-100 dark:border-orange-800/30' :
              product.novaGroup === 2 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-100 dark:border-yellow-800/30' :
              product.novaGroup === 1 ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/30' :
              'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
            }`}>
              <div className={`text-xs font-medium mb-1 ${
                product.novaGroup === 4 ? 'text-red-700 dark:text-red-400' :
                product.novaGroup === 3 ? 'text-orange-700 dark:text-orange-400' :
                product.novaGroup === 2 ? 'text-yellow-700 dark:text-yellow-400' :
                product.novaGroup === 1 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
              }`}>{t.novaGroup}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-500 mb-2">{t.novaGroupExplain}</div>
              <div className={`text-3xl font-bold ${
                product.novaGroup === 4 ? 'text-red-600 dark:text-red-400' :
                product.novaGroup === 3 ? 'text-orange-600 dark:text-orange-400' :
                product.novaGroup === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                product.novaGroup === 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {score.healthScore.nova || '?'}
              </div>
              <div className={`text-[10px] font-medium ${
                product.novaGroup === 4 ? 'text-red-500 dark:text-red-400' :
                product.novaGroup === 3 ? 'text-orange-500 dark:text-orange-400' :
                product.novaGroup === 2 ? 'text-yellow-600 dark:text-yellow-400' :
                product.novaGroup === 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
              }`}>
                {score.healthScore.nova === 1 && t.novaUnprocessed}
                {score.healthScore.nova === 2 && t.novaMinimallyProcessed}
                {score.healthScore.nova === 3 && t.novaProcessed}
                {score.healthScore.nova === 4 && t.novaUltraProcessed}
              </div>
            </div>
          </div>
        </div>

        {/* Lignende norske produkter - kun vis når vi faktisk har produkter */}
        {hasNorwegianProducts && (
          <div className="mx-4 mt-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-lg">🇳🇴</span>
                {product.isNorwegian ? t.similarNorwegianProducts : t.norwegianAlternatives}
              </h3>
              <div className="space-y-2">
                {norwegianProducts.slice(0, 5).map((alt, i) => (
                  <button
                    type="button"
                    key={`no-${alt.barcode}-${i}`}
                    onClick={() => onSelectProduct?.(alt.barcode)}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors cursor-pointer text-left touch-manipulation"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {alt.imageUrl ? (
                        <Image
                          src={alt.imageUrl}
                          alt={alt.name}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">{alt.name}</span>
                        {['a', 'b', 'c', 'd', 'e'].includes(alt.ecoscore.grade) ? (
                          <div
                            className={`px-2 py-0.5 ${getScoreColor(
                              alt.ecoscore.grade === 'a' ? 90 :
                              alt.ecoscore.grade === 'b' ? 70 :
                              alt.ecoscore.grade === 'c' ? 50 :
                              alt.ecoscore.grade === 'd' ? 30 : 20
                            )} rounded-full flex-shrink-0`}
                          >
                            <span className="text-white text-sm font-bold">
                              {alt.ecoscore.grade.toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 bg-gray-300 rounded-full flex-shrink-0">
                            <span className="text-gray-600 text-sm font-bold">?</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alt.brand}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Open Food Facts Link */}
        <div className="mx-4 mb-4">
          <a
            href={`https://no.openfoodfacts.org/product/${product.barcode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <span>{t.seeMoreOnOFF}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4">
          <button
            type="button"
            onClick={() => {
              if (onScanAgain) {
                onScanAgain();
              } else {
                onClose();
              }
            }}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg touch-manipulation"
          >
            {t.scanNewProduct}
          </button>
        </div>
      </div>
    </div>
  );
}
