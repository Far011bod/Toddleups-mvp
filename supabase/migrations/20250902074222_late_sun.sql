/*
  # Add increment XP function

  1. Functions
    - `increment_user_xp` - Safely increments user XP and updates the updated_at timestamp
  
  2. Security
    - Function uses SECURITY DEFINER to ensure proper permissions
    - Only updates the specific user's XP value
*/

CREATE OR REPLACE FUNCTION increment_user_xp(user_id uuid, xp_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET 
    xp = xp + xp_amount,
    updated_at = now()
  WHERE id = user_id;
END;
$$;