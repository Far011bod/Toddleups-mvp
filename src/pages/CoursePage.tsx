'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Circle, Lock, BookOpen } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BackButton } from '../components/BackButton';
import clsx from 'clsx';

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t, language, isRTL } = useLanguage();
  const { courses, lessons, userProgress } = useData();

  // Find the current course
  const course = courses.find(c => c.id === courseId);
  
  // Filter lessons for this course and add progress information
  const courseLessons = lessons
    .filter(lesson => lesson.course_id === courseId)
    .sort((a, b) => a.order_index - b.order_index)
    .map((lesson, index, sortedLessons) => {
      const progress = userProgress.find(p => p.lesson_id === lesson.id);
      const completed = progress?.completed || false;
      
      // First lesson is always unlocked, others unlock when previous is completed
      const isUnlocked = index === 0 || 
        (sortedLessons[index - 1] && 
         userProgress.find(p => p.lesson_id === sortedLessons[index - 1].id)?.completed);
      
      return {
        ...lesson,
        completed,
        isUnlocked,
      };
    });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{t('common.error')}</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BackButton />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === 'fa' ? course.title_fa : course.title}
          </h1>
          
          <p className="text-gray-400 mb-4">
            {language === 'fa' ? course.description_fa : course.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              course.difficulty === 'beginner' && 'bg-green-900/50 text-green-400',
              course.difficulty === 'intermediate' && 'bg-yellow-900/50 text-yellow-400',
              course.difficulty === 'advanced' && 'bg-red-900/50 text-red-400'
            )}>
              {t(`common.${course.difficulty}`)}
            </span>
            <span className="text-gray-500">
              {course.estimated_hours} {t('course.hours')}
            </span>
          </div>
        </div>

        {/* Lessons List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">{t('course.lessons')}</h2>
          
          {courseLessons.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No lessons available
              </h3>
              <p className="text-gray-500">
                This course is being prepared. Check back soon!
              </p>
            </div>
          ) : (
          <div className="space-y-3">
            {courseLessons.map((lesson, index) => {
              const canAccess = lesson.isUnlocked;
              
              return (
                <div
                  key={lesson.id}
                  className={clsx(
                    'bg-gray-800/50 border border-gray-700 rounded-lg p-4',
                    'transition-all duration-200',
                    canAccess && 'hover:bg-gray-800/70 hover:border-gray-600',
                    !canAccess && 'opacity-60'
                  )}
                >
                  {canAccess ? (
                    <Link
                      href={`/lesson/${lesson.id}`}
                      className="flex items-center gap-4 w-full"
                    >
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                          {language === 'fa' ? lesson.title_fa : lesson.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>+{lesson.xp_reward} XP</span>
                          <span>•</span>
                          <span>
                            {lesson.completed ? t('course.completed') : 
                             lesson.isUnlocked ? t('course.current') : t('course.locked')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-gray-500 text-sm">
                        {index + 1}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0">
                        <Lock className="w-6 h-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-gray-500 font-medium mb-1">
                          {language === 'fa' ? lesson.title_fa : lesson.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>+{lesson.xp_reward} XP</span>
                          <span>•</span>
                          <span>{t('course.locked')}</span>
                        </div>
                      </div>
                      
                      <div className="text-gray-600 text-sm">
                        {index + 1}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}