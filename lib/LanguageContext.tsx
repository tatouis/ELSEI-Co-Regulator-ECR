'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

type Locale = 'en' | 'fr';
type Translations = typeof en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, any> = { en, fr };

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('ecr_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLocaleState(saved);
    } else {
        // Fallback to browser language if it's French, otherwise English
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'fr') setLocaleState('fr');
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('ecr_locale', newLocale);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let value = translations[locale];
    
    for (const key of keys) {
      if (value?.[key] !== undefined) {
        value = value[key];
      } else {
        // Fallback to English if not found in current locale
        let fallbackValue = translations['en'];
        for (const fKey of keys) {
            fallbackValue = fallbackValue?.[fKey];
        }
        return fallbackValue || path;
      }
    }
    
    return value || path;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
