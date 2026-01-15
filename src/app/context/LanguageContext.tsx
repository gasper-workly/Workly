'use client';

import React, { createContext, useEffect, useMemo, useState } from 'react';
import type { LanguageCode, TranslationKey } from '@/app/lib/translations';
import { translations } from '@/app/lib/translations';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'workly_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('sl');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored === 'en' || stored === 'sl') {
        setLanguageState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (key) => translations[language]?.[key] ?? translations.en[key] ?? key,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return ctx;
}


