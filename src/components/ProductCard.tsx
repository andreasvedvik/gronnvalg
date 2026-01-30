'use client';

import { ProductData } from '@/lib/openfoodfacts';
import { GrønnScoreResult, getScoreColor, getScoreTextColor, getGradeEmoji } from '@/lib/scoring';
import { X, Leaf, Heart, Truck, Package, Award, Recycle, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: ProductData;
  score: GrønnScoreResult;
  onClose: () => void;
  alternatives?: ProductData[];
}

export default function ProductCard({ product, score, onClose, alternatives = [] }: ProductCardProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10 rounded-t-3xl">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
            <span className="text-xl" title="Norskprodusert">🇳🇴</span>
          )}
        </div>

        {/* Product Hero */}
        <div className="bg-gradient-to-b from-green-50 to-white px-6 py-6">
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>

            {/* Scores */}
            <div className="flex-1">
              <div className="flex gap-3">
                {/* GrønnScore */}
                <div className="flex-1 text-center">
                  <div
                    className={`w-16 h-16 mx-auto ${getScoreColor(score.total)} rounded-2xl flex items-center justify-center mb-1 shadow-md`}
                  >
                    <span className="text-white text-2xl font-bold">{score.grade}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Leaf className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-gray-600">GrønnScore</span>
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
                    <span className="text-xs font-medium text-gray-600">Næringsinfo</span>
                  </div>
                  <span className={`text-lg font-bold ${getScoreTextColor(score.healthScore.total)}`}>
                    {score.healthScore.total}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Labels/Certifications */}
          {product.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.labels.slice(0, 4).map((label, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  <Award className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        <div className="mx-4 mt-2 bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            Hvorfor denne scoren?
          </h3>
          <div className="space-y-3">
            {Object.entries(score.breakdown).map(([key, data]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {key === 'transport' && <Truck className="w-4 h-4 text-gray-600" />}
                  {key === 'packaging' && <Package className="w-4 h-4 text-gray-600" />}
                  {key === 'ecoscore' && <Recycle className="w-4 h-4 text-gray-600" />}
                  {key === 'norwegian' && <span className="text-sm">🇳🇴</span>}
                  {key === 'certifications' && <Award className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 truncate">{data.label}</span>
                    <span className={`text-sm font-medium ${getScoreTextColor(data.score)}`}>
                      {data.score}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(data.score)} rounded-full transition-all duration-500`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{data.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Details */}
        <div className="mx-4 mt-4 bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Helseinformasjon
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 text-center p-3 bg-white rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Nutri-Score</div>
              <div className={`text-2xl font-bold ${getScoreTextColor(score.healthScore.total)}`}>
                {score.healthScore.nutriscore || '?'}
              </div>
            </div>
            <div className="flex-1 text-center p-3 bg-white rounded-xl">
              <div className="text-sm text-gray-500 mb-1">NOVA-gruppe</div>
              <div className="text-2xl font-bold text-gray-700">
                {score.healthScore.nova || '?'}
              </div>
              <div className="text-xs text-gray-400">
                {score.healthScore.nova === 1 && 'Ubearbeidet'}
                {score.healthScore.nova === 2 && 'Lite bearbeidet'}
                {score.healthScore.nova === 3 && 'Bearbeidet'}
                {score.healthScore.nova === 4 && 'Ultrabearbeidet'}
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives Section */}
        {alternatives.length > 0 && (
          <div className="mx-4 mt-4 mb-6 bg-green-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">🇳🇴</span>
              Norsk Alternativ
            </h3>
            <div className="space-y-2">
              {alternatives.slice(0, 3).map((alt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {alt.imageUrl ? (
                      <img
                        src={alt.imageUrl}
                        alt={alt.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 truncate">{alt.name}</span>
                      <div
                        className={`px-2 py-0.5 ${getScoreColor(
                          alt.ecoscore.grade === 'a' ? 90 :
                          alt.ecoscore.grade === 'b' ? 70 :
                          alt.ecoscore.grade === 'c' ? 50 :
                          alt.ecoscore.grade === 'd' ? 30 : 20
                        )} rounded-full flex-shrink-0`}
                      >
                        <span className="text-white text-sm font-bold">
                          {alt.ecoscore.grade?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{alt.brand}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              ))}
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
            <span>Se mer på Open Food Facts</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
          >
            Skann nytt produkt
          </button>
        </div>
      </div>
    </div>
  );
}
