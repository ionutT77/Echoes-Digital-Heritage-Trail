import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

function LanguageSelector({ currentLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (languageCode) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  const selectedLanguage = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:shadow-lg transition-all border border-neutral-200 dark:border-neutral-700"
      >
        <Globe className="w-5 h-5 text-heritage-700 dark:text-heritage-400" />
        <span className="text-2xl">{selectedLanguage.flag}</span>
        <span className="hidden sm:inline font-medium text-neutral-900 dark:text-white">
          {selectedLanguage.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 min-w-[200px]">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleSelect(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-heritage-50 dark:hover:bg-heritage-900/20 transition-colors ${
                  language.code === currentLanguage ? 'bg-heritage-100 dark:bg-heritage-900/30' : ''
                }`}
              >
                <span className="text-2xl">{language.flag}</span>
                <span className="flex-1 text-left font-medium text-neutral-900 dark:text-white">
                  {language.name}
                </span>
                {language.code === currentLanguage && (
                  <Check className="w-5 h-5 text-heritage-700 dark:text-heritage-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSelector;
