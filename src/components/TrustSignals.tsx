'use client';

import { Database, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function TrustSignals() {
  const { t, language } = useLanguage();

  return (
    <div className="px-6 pb-8 animate-fade-in-up stagger-6">
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <Database className="w-4 h-4" />
          <span className="text-xs font-medium">
            {language === 'nb' ? '2M+ produkter' : '2M+ products'}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">{t.privacyFirstDescription}</span>
        </div>
      </div>
    </div>
  );
}
