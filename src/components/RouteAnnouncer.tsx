'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';

/**
 * Announces route changes to screen readers
 * Uses a live region to announce the current page title
 */
export default function RouteAnnouncer() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    // Map routes to readable names
    const routeNames: Record<string, { nb: string; en: string }> = {
      '/': { nb: 'Hjem', en: 'Home' },
      '/personvern': { nb: 'Personvernerklæring', en: 'Privacy Policy' },
      '/om': { nb: 'Om oss', en: 'About Us' },
    };

    const route = routeNames[pathname] || {
      nb: 'Side',
      en: 'Page',
    };

    const pageText = language === 'nb' ? route.nb : route.en;
    const navigatedText = language === 'nb' ? 'Navigerte til' : 'Navigated to';

    // Small delay to ensure the DOM has updated
    const timer = setTimeout(() => {
      setAnnouncement(`${navigatedText} ${pageText}`);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, language]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
