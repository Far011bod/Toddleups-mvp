import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, BookOpen, Clock, Star, LogOut } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';

export function Dashboard() {
  const { t, language, isRTL } = useLanguage();
  const { userProfile, courses } = useData();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'book-open': BookOpen,
      'award': Award,
      'clock': Clock,
      'star': Star,
    };
    const IconComponent = icons[iconName] || BookOpen;
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Header */}
        <div className="flex justify-between items-center mb-8 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-baby-blue text-lg font-bold">
                {userProfile?.xp || 0} XP
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 text-lg font-bold">
                سطح {userProfile?.level || 1}
              </span>
            </div>
            
            <div className="hidden md:block text-purple-300 font-medium font-iransans">
              {userProfile?.rank_title || 'آموزنده تازه‌کار'}
            </div>
          </div>
          
          <div className="flex items-center gap-4"></div>
        </div>
        {/* Main Content Area */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-8 font-iransans">دوره‌های آموزشی</h1>
          
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No courses available yet
              </h3>
              <p className="text-gray-500">
                Check back soon for new learning opportunities!
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/course/${course.id}`}
                className={clsx(
                  'block bg-gray-800/50 border border-gray-700 rounded-xl p-6',
                  'hover:bg-gray-800/70 hover:border-blue-500',
                  'transition-all duration-200 transform hover:scale-105',
                  'group shadow-lg hover:shadow-blue-500/20'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getIconComponent(course.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors font-iransans">
                      {course.title_fa}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-iransans">
                      {course.description_fa}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={getDifficultyColor(course.difficulty)}>
                        {t(`common.${course.difficulty}`)}
                      </span>
                      <span className="text-gray-500">
                        {course.estimated_hours} {t('course.hours')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}