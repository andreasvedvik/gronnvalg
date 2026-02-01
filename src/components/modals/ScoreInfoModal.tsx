'use client';

import { X, Leaf, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScoreInfoModal({ isOpen, onClose }: ScoreInfoModalProps) {
  const { t } = useLanguage();
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div ref={focusTrapRef} role="dialog" aria-modal="true" aria-labelledby="score-info-title" className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="score-info-title" className="text-xl font-bold text-gray-900 dark:text-white">{t.whatIsMiljoscore}</h2>
            <button onClick={onClose} aria-label={t.close} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t.miljoscoreDescription}
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t.environmentalImpact}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.environmentalImpactDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t.originLabel}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.originDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t.certificationsLabel}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.certificationsDesc}</p>
              </div>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t.gradeScale}</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { grade: 'A', range: '80-100', color: 'bg-green-500' },
                { grade: 'B', range: '60-79', color: 'bg-lime-500' },
                { grade: 'C', range: '40-59', color: 'bg-yellow-500' },
                { grade: 'D', range: '20-39', color: 'bg-orange-500' },
                { grade: 'E', range: '0-19', color: 'bg-red-500' },
              ].map(item => (
                <div key={item.grade} className="text-center">
                  <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                    <span className="text-white font-bold">{item.grade}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.range}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>{t.dataQuality}:</strong> {t.scoreDisclaimer}{' '}
              <a href="/om" className="underline">{t.aboutUs}</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
