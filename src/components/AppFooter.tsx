'use client';

import { Mail, Database, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

interface AppFooterProps {
  onShowContact: () => void;
}

export default function AppFooter({ onShowContact }: AppFooterProps) {
  const { language } = useLanguage();

  return (
    <footer className="px-6 pb-8 text-center safe-bottom">
      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mb-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Database className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">2M+ {language === 'nb' ? 'produkter' : 'products'}</span>
        </div>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">{language === 'nb' ? 'Data lagres kun på din enhet' : 'Data stored only on your device'}</span>
        </div>
      </div>

      {/* Open Food Facts attribution */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Image
          src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg"
          alt="Open Food Facts"
          width={120}
          height={24}
          className="opacity-60 hover:opacity-100 transition-opacity dark:invert"
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {language === 'nb' ? 'Data fra' : 'Data from'}{' '}
        <a
          href="https://openfoodfacts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 dark:text-green-400 hover:underline font-semibold"
        >
          Open Food Facts
        </a>
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Grønnest © 2026</p>

      {/* Links */}
      <div className="mt-5 flex items-center justify-center gap-4 text-sm">
        <Link
          href="/om"
          className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          {language === 'nb' ? 'Om Grønnest' : 'About Grønnest'}
        </Link>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <Link
          href="/personvern"
          className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          {language === 'nb' ? 'Personvern' : 'Privacy'}
        </Link>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <Link
          href="/vilkar"
          className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          {language === 'nb' ? 'Vilkår' : 'Terms'}
        </Link>
      </div>

      {/* Contact Info */}
      <button
        onClick={onShowContact}
        className="mt-4 text-sm text-green-600 dark:text-green-400 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto py-2 px-4 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
      >
        <Mail className="w-4 h-4" />
        {language === 'nb' ? 'Kontakt oss' : 'Contact us'}
      </button>
    </footer>
  );
}
