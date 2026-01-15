'use client';

import { useLanguageContext } from '@/app/context/LanguageContext';

export function useTranslation() {
  return useLanguageContext();
}


