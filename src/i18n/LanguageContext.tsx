import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './dictionaries/en';
import { id } from './dictionaries/id';
import type { Dictionary, Language } from './types';

const LANGUAGE_STORAGE_KEY = 'pmf-language';

function readStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'id' || stored === 'en' ? stored : null;
  } catch {
    return null;
  }
}

function detectLanguage(): Language {
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'id';
}

function resolveInitialLanguage(): Language {
  return readStoredLanguage() ?? detectLanguage();
}

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  dictionary: Dictionary;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(resolveInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // localStorage bisa gagal diakses (mis. private browsing) — bahasa tetap
      // berlaku untuk sesi ini, cuma tidak dipersist.
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, dictionary: language === 'en' ? en : id }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
