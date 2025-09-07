import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function ProtectedLayout({ children, showNav = true }: ProtectedLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { loading: dataLoading, clearData } = useData();
  const { t } = useLanguage();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setUser(session?.user ?? null);
        
        // Ensure profile exists for authenticated user
        if (session?.user) {
          await ensureProfileExists(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);

        // Ensure profile exists for any authenticated user
        if (session?.user) {
          await ensureProfileExists(session.user);
        }
        
        // Clear data when user logs out
        if (event === 'SIGNED_OUT') {
          clearData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfileExists = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If no profile exists, create one
      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            xp: 0,
            level: 1,
            rank_title: 'آموزنده تازه‌کار',
          });
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      clearData();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading screen while checking authentication
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 font-iransans">
            Toddle Ups
          </h1>
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4 font-iransans">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Render protected content with navigation
  return (
    <div className="min-h-screen bg-dark-blue text-white">
      {showNav && (
        <nav className="border-b border-gray-800 bg-dark-blue/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-xl font-bold font-iransans">Toddle Ups</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors font-iransans"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/leaderboard"
                  className="text-gray-300 hover:text-white transition-colors font-iransans"
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
                  <UserIcon className={clsx(
                    'w-4 h-4',
                    user.user_metadata?.avatar_url ? 'hidden' : 'block'
                  )} />
                  <Link 
                    to="/profile"
                    className="text-sm hidden sm:inline hover:text-white transition-colors"
                  >
                    {user.email}
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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