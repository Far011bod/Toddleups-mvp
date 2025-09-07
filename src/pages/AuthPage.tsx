import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Zap, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FormInput } from '../components/FormInput';
import { useFormValidation } from '../hooks/useFormValidation';
import clsx from 'clsx';

export function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const { t, isRTL } = useLanguage();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validationRules = {
    name: {
      required: isSignUp,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 6,
      custom: (value: string) => {
        if (!/(?=.*[a-z])/.test(value)) {
          return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(value)) {
          return 'Password must contain at least one number';
        }
        return null;
      }
    },
  };

  const {
    errors,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    clearErrors,
    hasErrors
  } = useFormValidation(validationRules);

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const formValues = { name, email, password };
    if (!validateForm(formValues)) {
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      clearErrors();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSubmitError('');
      await signInWithGoogle();
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    clearErrors();
    setSubmitError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={clsx(
        'w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl p-8',
        'backdrop-blur-sm shadow-2xl'
      )}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? t('auth.signup') : t('auth.signin')}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <FormInput
              label={t('auth.name')}
              type="text"
              value={name}
              onChange={(value) => {
                setName(value);
                handleFieldChange('name', value);
              }}
              onBlur={() => handleFieldBlur('name', name)}
              error={errors.name}
              required={isSignUp}
              isRTL={isRTL}
            />
          )}
          
          <FormInput
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              handleFieldChange('email', value);
            }}
            onBlur={() => handleFieldBlur('email', email)}
            error={errors.email}
            required
            isRTL={isRTL}
          />
          
          <FormInput
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              handleFieldChange('password', value);
            }}
            onBlur={() => handleFieldBlur('password', password)}
            error={errors.password}
            required
            isRTL={isRTL}
          />

          {submitError && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || hasErrors}
            className={clsx(
              'w-full py-3 px-4 bg-orange-500 hover:bg-orange-600',
              'text-white font-semibold rounded-lg',
              'transition-all duration-200 transform hover:scale-105',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-orange-500',
              'shadow-lg hover:shadow-orange-500/25'
            )}
          >
            {loading ? t('common.loading') : (isSignUp ? t('auth.signup') : t('auth.signin'))}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className={clsx(
              'w-full mt-4 py-3 px-4 bg-gray-700 hover:bg-gray-600',
              'text-white font-medium rounded-lg border border-gray-600',
              'transition-all duration-200 transform hover:scale-105',
              'flex items-center justify-center gap-2'
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google')}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleModeSwitch}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            {isSignUp ? t('auth.have-account') : t('auth.no-account')}
          </button>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
        {[
          {
            icon: Rocket,
            title: isRTL ? 'یادگیری هوشمند' : 'Smart Learning',
            description: isRTL ? 'با مسیرهای شخصی‌سازی شده یاد بگیرید' : 'Learn with personalized pathways'
          },
          {
            icon: Zap,
            title: isRTL ? 'پیشرفت سریع' : 'Quick Progress',
            description: isRTL ? 'مهارت‌های عملی در کمترین زمان' : 'Practical skills in minimal time'
          },
          {
            icon: Trophy,
            title: isRTL ? 'انگیزه بالا' : 'Stay Motivated',
            description: isRTL ? 'با سیستم امتیازات و چالش‌ها' : 'With points and challenges'
          }
        ].map((feature, index) => (
          <div
            key={index}
            className={clsx(
              'text-center p-6 rounded-xl bg-gray-800/50 border border-gray-700',
              'hover:bg-gray-800/70 transition-all duration-300',
              'hover:transform hover:scale-105 hover:shadow-lg'
            )}
          >
            <feature.icon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}