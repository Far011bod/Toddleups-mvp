import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          xp: number
          level: number
          rank_title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          xp?: number
          level?: number
          rank_title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          xp?: number
          level?: number
          rank_title?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          title_fa: string
          description: string
          description_fa: string
          icon: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_hours: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          title_fa: string
          description: string
          description_fa: string
          icon: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_hours: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_fa?: string
          description?: string
          description_fa?: string
          icon?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          estimated_hours?: number
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          title_fa: string
          content: string
          content_fa: string
          order_index: number
          xp_reward: number
          quiz_questions: Json
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          title_fa: string
          content: string
          content_fa: string
          order_index: number
          xp_reward: number
          quiz_questions: Json
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          title_fa?: string
          content?: string
          content_fa?: string
          order_index?: number
          xp_reward?: number
          quiz_questions?: Json
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          score?: number | null
          created_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
  }
}