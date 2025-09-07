import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { BackButton } from '../components/BackButton';
import clsx from 'clsx';

interface LeaderboardEntry {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  xp: number;
  rank: number;
}

export function Leaderboard() {
  const { t } = useLanguage();
  const { userProfile } = useData();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, xp, avatar_url')
        .order('xp', { ascending: false })
        .limit(50);

      const leaderboardWithRanks = data?.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })) || [];

      setLeaderboard(leaderboardWithRanks);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('leaderboard.title')}</h1>
          <p className="text-gray-400">Top learners in the Toddle Ups community</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={clsx(
                'flex items-center gap-4 p-4 border-b border-gray-700 last:border-b-0',
                'hover:bg-gray-800/70 transition-all duration-200',
                entry.id === userProfile?.id && 'bg-blue-900/30 border-blue-800'
              )}
            >
              <div className="flex-shrink-0 w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={`${entry.name || entry.email} avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={clsx(
                      'w-full h-full flex items-center justify-center text-sm font-bold text-white',
                      entry.avatar_url ? 'hidden' : 'flex'
                    )}
                  >
                    {entry.name ? entry.name[0].toUpperCase() : entry.email[0].toUpperCase()}
                  </div>
                </div>
                
                <div>
                <h3 className="text-white font-medium">
                  {entry.name || entry.email.split('@')[0]}
                </h3>
                <p className="text-gray-400 text-sm">{entry.email}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white font-bold">{entry.xp}</p>
                <p className="text-gray-400 text-sm">{t('leaderboard.xp')}</p>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No learners yet
            </h3>
            <p className="text-gray-500">
              Be the first to earn XP and appear on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}