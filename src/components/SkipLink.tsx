'use client';

import { useLanguage } from '@/lib/i18n';

/**
 * Skip navigation link for keyboard users
 * Allows users to skip directly to main content
 */
export default function SkipLink() {
  const { language } = useLanguage();

  const text = language === 'nb' ? 'Hopp til hovedinnhold' : 'Skip to main content';

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
    >
      {text}
    </a>
  );
}
