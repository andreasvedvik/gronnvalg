'use client';

import { Globe } from 'lucide-react';
import { useLanguage, Language } from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
}

export default function LanguageSelector({ variant = 'button', showLabel = false }: LanguageSelectorProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'nb', label: 'Norsk', flag: '🇳🇴' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-soft border border-gray-100 dark:border-gray-700 transition-all hover:scale-105 active:scale-95"
        aria-label={`Bytt språk til ${language === 'nb' ? 'engelsk' : 'norsk'}`}
        title={`${currentLang.flag} ${currentLang.label}`}
      >
        <span className="text-lg">{currentLang.flag}</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
