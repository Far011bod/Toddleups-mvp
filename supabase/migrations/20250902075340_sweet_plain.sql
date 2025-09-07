/*
  # Create avatars storage bucket and policies

  1. Storage Setup
    - Create `avatars` bucket for user profile pictures
    - Set bucket to public for easy access to avatar images

  2. Security Policies
    - Allow authenticated users to upload avatars to their own folder
    - Allow public read access to all avatars
    - Allow users to update/delete their own avatars

  3. Notes
    - Files are stored with path: `{user_id}/avatar.{extension}`
    - Bucket is public to avoid signed URL complexity
    - Users can only manage files in their own folder
*/

-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);