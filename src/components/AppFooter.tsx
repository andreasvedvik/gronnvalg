'use client';

import { Mail } from 'lucide-react';
import Link from 'next/link';

interface AppFooterProps {
  onShowContact: () => void;
}

export default function AppFooter({ onShowContact }: AppFooterProps) {
  return (
    <footer className="px-6 pb-8 text-center safe-bottom">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img
          src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg"
          alt="Open Food Facts"
          className="h-5 opacity-50 dark:invert"
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Data fra{' '}
        <a
          href="https://openfoodfacts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 dark:text-green-400 hover:underline font-medium"
        >
          Open Food Facts
        </a>
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Grønnest © 2026</p>

      {/* Links */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <Link
          href="/om"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          Om Grønnest
        </Link>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <Link
          href="/personvern"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          Personvern
        </Link>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <Link
          href="/vilkar"
          className="text-green-600 dark:text-green-400 hover:underline"
        >
          Vilkår
        </Link>
      </div>

      {/* Contact Info */}
      <button
        onClick={onShowContact}
        className="mt-4 text-xs text-green-600 dark:text-green-400 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
      >
        <Mail className="w-3 h-3" />
        Kontakt oss
      </button>
    </footer>
  );
}
