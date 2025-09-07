import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  rank_title: string;
}

interface Course {
  id: string;
  title: string;
  title_fa: string;
  description: string;
  description_fa: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  title_fa: string;
  content: string;
  content_fa: string;
  order_index: number;
  xp_reward: number;
  quiz_questions: Array<{
    question: string;
    question_fa: string;
    options: string[];
    options_fa: string[];
    correct: number;
  }>;
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  score: number | null;
}

interface DataContextType {
  userProfile: UserProfile | null;
  courses: Course[];
  lessons: Lesson[];
  userProgress: UserProgress[];
  loading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
  refreshUserProgress: () => Promise<void>;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      clearData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel for better performance
      const [profileResult, coursesResult, lessonsResult, progressResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        supabase
          .from('courses')
          .select('*')
          .order('created_at'),
        
        supabase
          .from('lessons')
          .select('*')
          .order('course_id, order_index'),
        
        supabase
          .from('user_progress')
          .select('lesson_id, completed, completed_at, score')
          .eq('user_id', user.id)
      ]);

      // Handle profile data
      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
        setError('Failed to fetch user profile');
      } else {
        setUserProfile(profileResult.data);
      }

      // Handle courses data
      if (coursesResult.error) {
        console.error('Error fetching courses:', coursesResult.error);
        setError('Failed to fetch courses');
      } else {
        setCourses(coursesResult.data || []);
      }

      // Handle lessons data
      if (lessonsResult.error) {
        console.error('Error fetching lessons:', lessonsResult.error);
        setError('Failed to fetch lessons');
      } else {
        setLessons(lessonsResult.data || []);
      }

      // Handle user progress data
      if (progressResult.error) {
        console.error('Error fetching user progress:', progressResult.error);
        setError('Failed to fetch user progress');
      } else {
        setUserProgress(progressResult.data || []);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('An unexpected error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const refreshUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_id, completed, completed_at, score')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error refreshing user progress:', error);
      } else {
        setUserProgress(data || []);
      }
    } catch (err) {
      console.error('Error refreshing user progress:', err);
    }
  };

  const clearData = () => {
    setUserProfile(null);
    setCourses([]);
    setLessons([]);
    setUserProgress([]);
    setLoading(false);
    setError(null);
  };

  return (
    <DataContext.Provider
      value={{
        userProfile,
        courses,
        lessons,
        userProgress,
        loading,
        error,
        refreshUserProfile,
        refreshUserProgress,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}