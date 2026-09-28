import { useTranslation } from '../i18n';
import type { Language } from '../i18n';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'id', label: 'ID' },
  { code: 'en', label: 'EN' },
];

/** Toggle bahasa global (AppFooter) — gaya pill/segmented sama seperti TabButton di RoleTabsSection. */
export function LanguageSwitch() {
  const { language, setLanguage } = useTranslation();

  return (
    <div role="group" aria-label="Language" className="inline-flex gap-0.5 rounded-full bg-neutral-100 p-0.5">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
            language === code ? 'bg-brand-ink text-white' : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
