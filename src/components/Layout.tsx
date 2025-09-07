import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { LogOut, User } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, showNav = true, showFooter = true }: LayoutProps) {
  const { t, isRTL } = useLanguage();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-dark-blue text-white">
      {showNav && (
        <nav className="border-b border-gray-800 bg-dark-blue/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <img 
                  src="/images/logo.webp" 
                  alt="Toddle Ups Logo" 
                  className="w-8 h-8 rounded-lg"
                  onError={(e) => {
                    // Fallback to placeholder if logo not found
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-orange-500 rounded-lg items-center justify-center hidden">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold">Toddle Ups</span>
              </Link>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      href="/leaderboard"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {t('nav.leaderboard')}
                    </Link>
                    <div className="flex items-center gap-2 text-gray-300">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <User className={clsx(
                        'w-4 h-4',
                        user.user_metadata?.avatar_url ? 'hidden' : 'block'
                      )} />
                      <Link 
                        href="/profile"
                        className="text-sm hidden sm:inline hover:text-white transition-colors"
                      >
                        {user.email}
                      </Link>
                    </div>
                    <button
                      onClick={signOut}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {t('nav.login')}
                    </Link>
                  </>
                )}
                <LanguageToggle />
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}