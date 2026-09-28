import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

/**
 * `t` sudah berupa dictionary aktif langsung (bukan fungsi lookup string
 * key), jadi pemakaian di komponen jadi `t.results.mainPosition.label` —
 * type-safe & autocomplete penuh dari TypeScript.
 */
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation harus dipakai di dalam LanguageProvider');
  }
  return { t: context.dictionary, language: context.language, setLanguage: context.setLanguage };
}
