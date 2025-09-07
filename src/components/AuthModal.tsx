import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FormInput } from './FormInput';
import { useFormValidation } from '../hooks/useFormValidation';
import clsx from 'clsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t, isRTL } = useLanguage();

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
      onClose();
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
      onClose();
      clearErrors();
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={clsx(
          'w-full max-w-md bg-dark-blue border border-gray-800 rounded-2xl p-6',
          'shadow-2xl transform transition-all'
        )}>
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-white">
              {isSignUp ? t('auth.signup') : t('auth.signin')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-blue text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className={clsx(
                'w-full mt-4 py-2 px-4 bg-gray-800 hover:bg-gray-700',
                'text-white font-medium rounded-lg border border-gray-700',
                'transition-all duration-200 transform hover:scale-105'
              )}
            >
              {t('auth.google')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleModeSwitch}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isSignUp ? t('auth.have-account') : t('auth.no-account')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}