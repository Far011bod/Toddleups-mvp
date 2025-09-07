import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, Zap, Wrench, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { FormInput } from '../components/FormInput';
import { useFormValidation } from '../hooks/useFormValidation';
import clsx from 'clsx';

export function LandingPage() {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [featuresVisible, setFeaturesVisible] = useState(false);

  const validationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  };

  const {
    errors,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    hasErrors
  } = useFormValidation(validationRules);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFeaturesVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm({ email })) {
      return;
    }

    setLoading(true);

    try {
      await supabase
        .from('waitlist')
        .insert({ email });
      
      setSubmitted(true);
      setEmail('');
    } catch (error) {
      setSubmitError('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToWaitlist = () => {
    document.getElementById('waitlist-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-dark-blue relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-gray-800/50 bg-dark-blue/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-white font-iransans">Toddle Ups</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className={clsx(
                  'px-4 py-2 text-blue-600 hover:text-blue-500 font-medium',
                  'transition-all duration-200 font-iransans'
                )}
              >
                ورود
              </Link>
              <Link
                to="/auth"
                className={clsx(
                  'px-6 py-2 bg-orange-500 hover:bg-orange-600',
                  'text-white font-medium rounded-lg',
                  'transition-all duration-200 transform hover:scale-105',
                  'shadow-lg hover:shadow-orange-500/25 font-iransans'
                )}
              >
                ثبت‌نام
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <h1 className={clsx(
            'text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6',
            'leading-tight font-iransans animate-fade-in'
          )}>
            یادگیری نرم‌افزار، این بار مثل بازی.
          </h1>
          
          <p className={clsx(
            'text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto',
            'leading-relaxed font-iransans'
          )}>
            ما آموزش‌های خسته‌کننده و طولانی را به مراحل کوتاه، جذاب و امتیازآور تبدیل می‌کنیم تا در کمترین زمان، به مهارت‌های جدید مسلط شوید.
          </p>

          <button
            onClick={scrollToWaitlist}
            className={clsx(
              'px-12 py-4 bg-orange-500 hover:bg-orange-600',
              'text-white text-xl font-bold rounded-xl font-iransans',
              'transition-all duration-200 transform hover:scale-105',
              'shadow-lg hover:shadow-orange-500/25',
              'border-2 border-orange-400/20 hover:border-orange-400/40'
            )}
          >
            به لیست انتظار بپیوندید
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="relative z-10 py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 font-iransans">
            چرا Toddle Ups؟
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Gamepad2,
                title: 'یادگیری گیمیفای شده',
                description: 'با کسب امتیاز (XP)، مدال و بالا رفتن در جدول امتیازات، انگیزه خود را حفظ کنید.'
              },
              {
                icon: Zap,
                title: 'درس‌های کوچک و سریع',
                description: 'دیگر خبری از ویدیوهای چند ساعته نیست. هر مهارت یک درس کوتاه و کاربردی است.'
              },
              {
                icon: Wrench,
                title: 'مهارت‌های دنیای واقعی',
                description: 'ترفندهایی را یاد بگیرید که در دانشگاه و محیط کار واقعا به دردتان می‌خورد.'
              },
              {
                icon: Users,
                title: 'بخشی از آینده باش',
                description: 'به کامیونیتی اولیه ما بپیوندید و اولین نفر باشید که محصول نهایی را تست می‌کند.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={clsx(
                  'feature-card bg-gray-800/40 border border-gray-700/50 rounded-xl p-6',
                  'hover:bg-gray-800/60 hover:border-gray-600/50',
                  'transition-all duration-300 transform hover:scale-105',
                  'hover:shadow-lg hover:shadow-blue-500/10',
                  featuresVisible && 'animate-slide-up',
                  'text-center'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 font-iransans">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-iransans">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist Section */}
      <div id="waitlist-section" className="relative z-10 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-iransans">
            برای دسترسی زودهنگام و رایگان ثبت‌نام کنید
          </h2>
          
          <p className="text-gray-300 mb-8 font-iransans">
            اولین نفری باشید که از محصول نهایی مطلع می‌شوید
          </p>

          {submitted ? (
            <div className={clsx(
              'bg-green-900/20 border border-green-700 rounded-xl p-6',
              'text-green-300 text-center animate-fade-in'
            )}>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-iransans">
                ثبت‌نام موفقیت‌آمیز بود!
              </h3>
              <p className="font-iransans">
                به محض راه‌اندازی محصول، به شما اطلاع خواهیم داد.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <FormInput
                    label=""
                    type="email"
                    value={email}
                    onChange={(value) => {
                      setEmail(value);
                      handleFieldChange('email', value);
                    }}
                    onBlur={() => handleFieldBlur('email', email)}
                    error={errors.email}
                    placeholder="ایمیل شما"
                    required
                    isRTL={isRTL}
                    className="mb-0"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || hasErrors || !email}
                  className={clsx(
                    'px-8 py-3 bg-orange-500 hover:bg-orange-600',
                    'text-white font-semibold rounded-lg font-iransans',
                    'transition-all duration-200 transform hover:scale-105',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                    'shadow-lg hover:shadow-orange-500/25',
                    'whitespace-nowrap'
                  )}
                >
                  {loading ? 'در حال ثبت...' : 'ثبت‌نام می‌کنم'}
                </button>
              </div>
              
              {submitError && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded mt-4 text-center font-iransans">
                  {submitError}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 font-iransans">
            © 2025 Toddle Ups. تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
}