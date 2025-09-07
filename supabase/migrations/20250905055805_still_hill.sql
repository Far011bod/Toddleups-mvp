/*
  # Add Leveling and Rank System

  1. New Columns
    - `level` (integer, default 1) - User's current level
    - `rank_title` (text, default "آموزنده تازه‌کار") - User's rank title in Persian

  2. Changes
    - Add level and rank_title columns to profiles table
    - Set appropriate defaults for existing users

  3. Security
    - No changes to existing RLS policies needed
*/

-- Add level and rank_title columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN level integer DEFAULT 1 NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'rank_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rank_title text DEFAULT 'آموزنده تازه‌کار' NOT NULL;
  END IF;
END $$;