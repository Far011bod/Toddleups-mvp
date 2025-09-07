import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

export function BackButton() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const handleBack = () => {
    navigate(-1);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <button
      onClick={handleBack}
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-2',
        'bg-gray-800/50 hover:bg-gray-800/70',
        'text-gray-300 hover:text-white',
        'border border-gray-700 hover:border-gray-600',
        'rounded-lg transition-all duration-200',
        'text-sm font-medium'
      )}
    >
      <BackIcon className="w-4 h-4" />
      <span className="font-iransans">{t('common.back')}</span>
    </button>
  );
}