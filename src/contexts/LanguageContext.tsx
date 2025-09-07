'use client';

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Landing Page
    'landing.title': 'Master Software Skills Through Gamified Learning',
    'landing.subtitle': 'Learn Excel, PowerPoint, Photoshop, and more with bite-sized lessons designed for busy young professionals and students.',
    'landing.cta': 'Join Waitlist',
    'landing.email.placeholder': 'Enter your email address',
    'landing.email.success': 'Thanks for joining! We\'ll notify you when we launch.',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.leaderboard': 'Leaderboard',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    
    // Authentication
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.google': 'Continue with Google',
    'auth.forgot': 'Forgot Password?',
    'auth.no-account': 'Don\'t have an account?',
    'auth.have-account': 'Already have an account?',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.xp': 'XP',
    'dashboard.badges': 'Badges Earned',
    'dashboard.courses': 'Available Courses',
    'dashboard.continue': 'Continue Learning',
    'dashboard.start': 'Start Course',
    
    // Course Details
    'course.lessons': 'Lessons',
    'course.completed': 'Completed',
    'course.current': 'Current',
    'course.locked': 'Locked',
    'course.difficulty': 'Difficulty',
    'course.hours': 'hours',
    
    // Lesson Player
    'lesson.did-it': 'I Did It!',
    'lesson.next': 'Next Lesson',
    'lesson.submit': 'Submit Answer',
    'lesson.correct': 'Correct!',
    'lesson.incorrect': 'Try again',
    'lesson.correct-xp': 'Great! You earned +{xp} XP',
    'lesson.incorrect-retry': 'Incorrect! Try again',
    'lesson.retry': 'Review and Retry',
    
    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.rank': 'Rank',
    'leaderboard.user': 'User',
    'leaderboard.xp': 'XP',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.beginner': 'Beginner',
    'common.intermediate': 'Intermediate',
    'common.advanced': 'Advanced',
    'common.back': 'Back',
  },
  fa: {
    // Landing Page
    'landing.title': 'یادگیری مهارت‌های نرم‌افزاری با گیمیفیکیشن',
    'landing.subtitle': 'اکسل، پاورپوینت، فتوشاپ و بیشتر را با درس‌های کوتاه طراحی‌شده برای حرفه‌ای‌های جوان و دانشجویان یاد بگیرید.',
    'landing.cta': 'عضویت در لیست انتظار',
    'landing.email.placeholder': 'آدرس ایمیل خود را وارد کنید',
    'landing.email.success': 'متشکریم! هنگام راه‌اندازی به شما اطلاع خواهیم داد.',
    
    // Navigation
    'nav.dashboard': 'داشبورد',
    'nav.leaderboard': 'جدول رتبه‌بندی',
    'nav.profile': 'پروفایل',
    'nav.logout': 'خروج',
    'nav.login': 'ورود',
    'nav.signup': 'ثبت‌نام',
    
    // Authentication
    'auth.signin': 'ورود',
    'auth.signup': 'ثبت‌نام',
    'auth.email': 'ایمیل',
    'auth.password': 'رمز عبور',
    'auth.name': 'نام کامل',
    'auth.google': 'ادامه با گوگل',
    'auth.forgot': 'رمز عبور را فراموش کرده‌اید؟',
    'auth.no-account': 'حساب کاربری ندارید؟',
    'auth.have-account': 'قبلاً حساب کاربری دارید؟',
    
    // Dashboard
    'dashboard.welcome': 'خوش آمدید',
    'dashboard.xp': 'امتیاز تجربه',
    'dashboard.badges': 'نشان‌های کسب شده',
    'dashboard.courses': 'دوره‌های موجود',
    'dashboard.continue': 'ادامه یادگیری',
    'dashboard.start': 'شروع دوره',
    
    // Course Details
    'course.lessons': 'درس‌ها',
    'course.completed': 'تکمیل شده',
    'course.current': 'فعلی',
    'course.locked': 'قفل شده',
    'course.difficulty': 'سطح دشواری',
    'course.hours': 'ساعت',
    
    // Lesson Player
    'lesson.did-it': 'انجام دادم!',
    'lesson.next': 'درس بعدی',
    'lesson.submit': 'ارسال پاسخ',
    'lesson.correct': 'درست!',
    'lesson.incorrect': 'دوباره تلاش کنید',
    'lesson.correct-xp': 'عالی بود! +{xp} امتیاز گرفتی',
    'lesson.incorrect-retry': 'جواب درست نبود! دوباره تلاش کن',
    'lesson.retry': 'مرور دوباره درس',
    
    // Leaderboard
    'leaderboard.title': 'جدول رتبه‌بندی',
    'leaderboard.rank': 'رتبه',
    'leaderboard.user': 'کاربر',
    'leaderboard.xp': 'امتیاز',
    
    // Common
    'common.loading': 'در حال بارگذاری...',
    'common.error': 'خطایی رخ داد',
    'common.beginner': 'مبتدی',
    'common.intermediate': 'متوسط',
    'common.advanced': 'پیشرفته',
    'common.back': 'بازگشت',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fa');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'fa')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        isRTL: language === 'fa' 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}