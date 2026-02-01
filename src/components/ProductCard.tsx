'use client';

import { useState } from 'react';
import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor, getScoreTextColor, getGradeEmoji } from '@/lib/scoring';
import { X, Leaf, Heart, Truck, Package, Award, Recycle, ChevronRight, ExternalLink, AlertCircle, HelpCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Share2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { getProductCertifications, CertificationInfo } from '@/lib/certifications';

interface ProductCardProps {
  product: ProductData;
  score: GrønnScoreResult;
  onClose: () => void;
  alternatives?: ProductData[];
  similarProducts?: ProductData[]; // KUN norske produkter
  onSelectProduct?: (barcode: string) => void; // Callback for selecting a similar product
  isLoadingExtras?: boolean; // True while loading alternatives, similar products
}

export default function ProductCard({ product, score, onClose, alternatives = [], similarProducts = [], onSelectProduct, isLoadingExtras = false }: ProductCardProps) {
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10 rounded-t-3xl">
          <button
            onClick={onClose}
            aria-label={t.close}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{product.name}</h2>
            <p className="text-sm text-gray-500 truncate">
              {product.brand} {product.origin && `• ${product.origin}`}
            </p>
          </div>
          {product.isNorwegian && (
            <span className="text-xl" title={t.producedInNorway}>🇳🇴</span>
          )}
          <button
            onClick={handleShare}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t.export}
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Product Hero */}
        <div className="bg-gradient-to-b from-green-50 to-white px-6 py-6">
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>

            {/* Scores */}
            <div className="flex-1">
              <div className="flex gap-3">
                {/* Miljøscore */}
                <div className="flex-1 text-center">
                  <div
                    className={`w-16 h-16 mx-auto ${getScoreColor(score.total)} rounded-2xl flex items-center justify-center mb-1 shadow-md`}
                  >
                    <span className="text-white text-2xl font-bold">{score.grade}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Leaf className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">{t.gronnScore}</span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreTextColor(score.total)}`}>
                    {score.total}/100
                  </span>
                </div>

                {/* Næringsinfo */}
                <div className="flex-1 text-center">
                  <div
                    className={`w-16 h-16 mx-auto ${getScoreColor(score.healthScore.total)} rounded-2xl flex items-center justify-center mb-1 shadow-md`}
                  >
                    <span className="text-white text-2xl font-bold">{score.healthScore.grade}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-xs font-medium text-gray-600">{t.nutritionInfo}</span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreTextColor(score.healthScore.total)}`}>
                    {score.healthScore.total}/100
                  </span>
                </div>
              </div>
            </div>
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
                {/* Show unrecognized labels as generic badges */}
                {product.labels
                  .filter(label => !certifications.some(cert =>
                    label.toLowerCase().includes(cert.id) ||
                    label.toLowerCase().includes(cert.name.toLowerCase()) ||
                    label.toLowerCase().includes(cert.nameEn.toLowerCase())
                  ))
                  .slice(0, 3)
                  .map((label, i) => (
                    <span
                      key={`label-${i}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      {label}
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
          <div className="mx-4 mt-2 bg-amber-50 border border-amber-200 rounded-2xl p-4">
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
        <div className="mx-4 mt-2 bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600" />
              {t.whyThisScore}
            </h3>
            {/* Data Quality Indicator */}
            <div className="flex items-center gap-1.5" title={`${t.dataQuality}: ${score.dataQuality}%`}>
              <span className="text-xs text-gray-500">Data:</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3 rounded-sm ${
                      i < Math.ceil(score.dataQuality / 20)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">{score.dataQuality}%</span>
            </div>
          </div>
          <div className="space-y-3">
            {Object.entries(score.breakdown).map(([key, data]) => (
              <div key={key} className={`flex items-center gap-3 ${!data.dataAvailable ? 'opacity-70' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm relative ${
                  data.dataAvailable ? 'bg-white' : 'bg-gray-100 border border-dashed border-gray-300'
                }`}>
                  {key === 'transport' && <Truck className="w-4 h-4 text-gray-600" />}
                  {key === 'packaging' && <Package className="w-4 h-4 text-gray-600" />}
                  {key === 'ecoscore' && <Recycle className="w-4 h-4 text-gray-600" />}
                  {key === 'norwegian' && <span className="text-sm">🇳🇴</span>}
                  {key === 'certifications' && <Award className="w-4 h-4 text-gray-600" />}
                  {!data.dataAvailable && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-yellow-900 font-bold">?</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-600 truncate">{data.label}</span>
                      {!data.dataAvailable && (
                        <span title={`${t.dataNotAvailable} - ${t.estimatedValue}`}>
                          <HelpCircle className="w-3 h-3 text-yellow-500" />
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${data.dataAvailable ? getScoreTextColor(data.score) : 'text-gray-400'}`}>
                      {data.dataAvailable ? data.score : `~${data.score}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${data.dataAvailable ? getScoreColor(data.score) : 'bg-gray-400'} rounded-full transition-all duration-500 ${
                        !data.dataAvailable ? 'opacity-50' : ''
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-0.5 truncate ${data.dataAvailable ? 'text-gray-500' : 'text-yellow-600 italic'}`}>
                    {data.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Low data quality warning */}
          {score.dataQuality < 50 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                {t.limitedData}. {t.limitedDataDescription}
              </p>
            </div>
          )}
        </div>

        {/* Ultra-processed Warning - Show prominently for NOVA 4 */}
        {product.novaGroup === 4 && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t.novaUltraProcessed}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {language === 'nb'
                    ? 'Dette produktet er ultrabearbeidet. Forskning viser at høyt inntak av ultrabearbeidet mat kan ha negative helseeffekter.'
                    : 'This product is ultra-processed. Research shows that high consumption of ultra-processed foods may have negative health effects.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Health Details */}
        <div className="mx-4 mt-4 bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            {t.healthInfo}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 text-center p-3 bg-white rounded-xl">
              <div className="text-sm text-gray-500 mb-0.5">{t.nutriScore}</div>
              <div className="text-[10px] text-gray-400 mb-1">{t.nutriScoreExplain}</div>
              <div className={`text-2xl font-bold ${getScoreTextColor(score.healthScore.total)}`}>
                {score.healthScore.nutriscore || '?'}
              </div>
            </div>
            <div className={`flex-1 text-center p-3 rounded-xl ${
              product.novaGroup === 4 ? 'bg-red-100 border border-red-200' :
              product.novaGroup === 3 ? 'bg-orange-50' :
              product.novaGroup === 2 ? 'bg-yellow-50' :
              product.novaGroup === 1 ? 'bg-green-50' : 'bg-white'
            }`}>
              <div className="text-sm text-gray-500 mb-0.5">{t.novaGroup}</div>
              <div className="text-[10px] text-gray-400 mb-1">{t.novaGroupExplain}</div>
              <div className={`text-2xl font-bold ${
                product.novaGroup === 4 ? 'text-red-600' :
                product.novaGroup === 3 ? 'text-orange-600' :
                product.novaGroup === 2 ? 'text-yellow-600' :
                product.novaGroup === 1 ? 'text-green-600' : 'text-gray-700'
              }`}>
                {score.healthScore.nova || '?'}
              </div>
              <div className={`text-xs ${
                product.novaGroup === 4 ? 'text-red-500 font-medium' :
                product.novaGroup === 3 ? 'text-orange-500' :
                product.novaGroup === 2 ? 'text-yellow-600' :
                product.novaGroup === 1 ? 'text-green-600' : 'text-gray-400'
              }`}>
                {score.healthScore.nova === 1 && t.novaUnprocessed}
                {score.healthScore.nova === 2 && t.novaMinimallyProcessed}
                {score.healthScore.nova === 3 && t.novaProcessed}
                {score.healthScore.nova === 4 && t.novaUltraProcessed}
              </div>
            </div>
          </div>
        </div>

        {/* Lignende norske produkter - kun norske produkter for norske brukere */}
        {(hasNorwegianProducts || isLoadingExtras) && (
          <div className="mx-4 mt-4 mb-6">
            <div className="bg-green-50 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🇳🇴</span>
                {product.isNorwegian ? t.similarNorwegianProducts : t.norwegianAlternatives}
                {isLoadingExtras && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
              </h3>
              <div className="space-y-2">
                {norwegianProducts.slice(0, 5).map((alt, i) => (
                  <button
                    key={`no-${alt.barcode}-${i}`}
                    onClick={() => onSelectProduct?.(alt.barcode)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer text-left"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative">
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
                        <span className="font-medium text-gray-900 truncate">{alt.name}</span>
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
                      <p className="text-xs text-gray-500 truncate">{alt.brand}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
              {norwegianProducts.length === 0 && !isLoadingExtras && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl opacity-50">🇳🇴</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t.noNorwegianProductsFound}
                  </p>
                </div>
              )}
              {norwegianProducts.length === 0 && isLoadingExtras && (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-200 rounded" />
                        <div className="h-3 w-1/2 bg-gray-200 rounded" />
                      </div>
                      <div className="w-8 h-6 bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Open Food Facts Link */}
        <div className="mx-4 mb-4">
          <a
            href={`https://no.openfoodfacts.org/product/${product.barcode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors"
          >
            <span>{t.seeMoreOnOFF}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
          >
            {t.scanNewProduct}
          </button>
        </div>
      </div>
    </div>
  );
}
