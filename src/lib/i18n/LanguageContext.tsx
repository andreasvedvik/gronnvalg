'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Translations, translations, getTranslation } from './translations';

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'gronnvalg-language';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'nb' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [t, setT] = useState<Translations>(translations[defaultLanguage]);

  // Load language preference from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (savedLanguage && (savedLanguage === 'nb' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      setT(getTranslation(savedLanguage));
    }
  }, []);

  // Update translations when language changes
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setT(getTranslation(lang));

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      // Update document lang attribute for accessibility
      document.documentElement.lang = lang;
    }
  }, []);

  // Toggle between Norwegian and English
  const toggleLanguage = useCallback(() => {
    const newLang: Language = language === 'nb' ? 'en' : 'nb';
    setLanguage(newLang);
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Shorthand hook for just translations
export function useTranslation(): Translations {
  const { t } = useLanguage();
  return t;
}
