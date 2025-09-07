import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Award, Camera, Upload, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

export function ProfilePage() {
  const navigate = useNavigate();
  const { userProfile, refreshUserProfile } = useData();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    // Cleanup preview URL when component unmounts or file changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser || !userProfile) return;

    setUploading(true);

    try {
      // Get file extension
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentUser.id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (userProfile.avatar_url) {
        const existingPath = userProfile.avatar_url.split('/').pop();
        if (existingPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${currentUser.id}/${existingPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Update local state
      await refreshUserProfile();
      setSelectedFile(null);
      setPreviewUrl(null);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleStartLearning = () => {
    navigate('/dashboard');
  };

  const getInitials = (name: string | null, email: string | undefined) => {
    if (!email) return '?';
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-dark-blue flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            پروفایل یافت نشد
          </h3>
          <p className="text-gray-500">
            امکان بارگذاری اطلاعات پروفایل شما وجود ندارد.
          </p>
        </div>
      </div>
    );
  }

  const hasBeginnerBadge = userProfile.xp >= 50;
  const currentAvatar = previewUrl || userProfile.avatar_url;

  return (
    <div className="min-h-screen bg-dark-blue py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="تصویر پروفایل"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={clsx(
                  'w-full h-full flex items-center justify-center text-2xl font-bold text-white',
                  currentAvatar ? 'hidden' : 'flex'
                )}
              >
                {getInitials(userProfile.name, userProfile.email)}
              </div>
            </div>
            
            {/* Upload Button */}
            <button
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className={clsx(
                'absolute bottom-0 right-0 w-10 h-10 bg-orange-500 hover:bg-orange-600',
                'rounded-full flex items-center justify-center',
                'transition-all duration-200 transform hover:scale-110',
                'border-2 border-dark-blue shadow-lg'
              )}
              disabled={uploading}
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Controls */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-300 mb-3 font-iransans">
                فایل انتخاب شده: {selectedFile.name}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700',
                    'text-white font-medium rounded-lg transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="font-iransans">
                    {uploading ? 'در حال آپلود...' : 'آپلود'}
                  </span>
                </button>
                
                <button
                  onClick={handleCancelUpload}
                  disabled={uploading}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700',
                    'text-white font-medium rounded-lg transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <X className="w-4 h-4" />
                  <span className="font-iransans">لغو</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Information */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-iransans">
            {userProfile.name || 'کاربر ناشناس'}
          </h1>
          <p className="text-lg text-gray-400 font-iransans">
            {userProfile.email}
          </p>
        </div>

        {/* XP Display */}
        <div className="text-center mb-12">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl md:text-7xl font-bold text-baby-blue font-iransans">
                {userProfile.xp}
              </span>
              <Star className="w-12 h-12 text-yellow-400 fill-current" />
            </div>
            <p className="text-xl text-gray-300 font-iransans">
              امتیاز تجربه
            </p>
          </div>
          
          {/* Level and Rank Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2 font-iransans">
                  {userProfile.level}
                </div>
                <p className="text-orange-300 font-medium font-iransans">
                  سطح
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-300 mb-2 font-iransans">
                  {userProfile.rank_title}
                </div>
                <p className="text-purple-400 font-medium font-iransans text-sm">
                  رتبه
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center font-iransans">
            مدال‌های شما
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {hasBeginnerBadge ? (
              <div className={clsx(
                'bg-gradient-to-br from-green-500/20 to-green-600/20',
                'border border-green-500/30 rounded-xl p-6',
                'text-center transform hover:scale-105 transition-all duration-200'
              )}>
                <Award className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-300 font-medium text-sm font-iransans">
                  مدال شروع
                </p>
              </div>
            ) : (
              <div className={clsx(
                'bg-gray-800/30 border border-gray-700/50 rounded-xl p-6',
                'text-center opacity-50'
              )}>
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm font-iransans">
                  مدال شروع
                </p>
                <p className="text-xs text-gray-600 mt-1 font-iransans">
                  ۵۰+ امتیاز نیاز
                </p>
              </div>
            )}
            
            {/* Placeholder badges */}
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className={clsx(
                  'bg-gray-800/30 border border-gray-700/50 rounded-xl p-6',
                  'text-center opacity-30'
                )}
              >
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 font-medium text-sm font-iransans">
                  مدال آینده
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={handleStartLearning}
            className={clsx(
              'px-12 py-4 bg-orange-500 hover:bg-orange-600',
              'text-white text-xl font-bold rounded-xl font-iransans',
              'transition-all duration-200 transform hover:scale-105',
              'shadow-lg hover:shadow-orange-500/25',
              'border-2 border-orange-400/20 hover:border-orange-400/40'
            )}
          >
            شروع یادگیری
          </button>
        </div>
      </div>
    </div>
  );
}