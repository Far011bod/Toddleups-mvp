import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-blue-600 hover:bg-blue-700 text-white',
        'transition-all duration-200 transform hover:scale-105'
      )}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === 'en' ? 'فا' : 'EN'}
      </span>
    </button>
  );
}