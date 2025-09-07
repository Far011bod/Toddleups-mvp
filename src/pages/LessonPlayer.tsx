import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Star, ArrowLeft } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { BackButton } from '../components/BackButton';
import clsx from 'clsx';

export function LessonPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { lessons, refreshUserProfile, refreshUserProgress } = useData();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackIcon, setFeedbackIcon] = useState<React.ComponentType<any>>(Check);
  const [feedbackButtonText, setFeedbackButtonText] = useState('');
  const [feedbackButtonAction, setFeedbackButtonAction] = useState<() => void>(() => {});
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    newRankTitle: string;
  } | null>(null);

  // Find the current lesson from context
  const lesson = lessons.find(l => l.id === lessonId);

  const handleDidIt = () => {
    setShowQuiz(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !lesson) return;

    setIsSubmittingAnswer(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-quiz-answer', {
        body: {
          lesson_id: lesson.id,
          user_answer_index: selectedAnswer,
          question_index: currentQuestion,
        },
      });

      if (error) {
        throw error;
      }

      if (data.correct) {
        // Correct answer
        setFeedbackMessage(t('lesson.correct-xp').replace('{xp}', data.xp_reward.toString()));
        setFeedbackIcon(Check);
        
        // Check for level up
        if (data.levelUp) {
          setLevelUpData({
            newLevel: data.newLevel,
            newRankTitle: data.newRankTitle
          });
          
          // Refresh user profile to get updated level and rank
          await refreshUserProfile();
        }
        
        if (currentQuestion < lesson.quiz_questions.length - 1) {
          setFeedbackButtonText(t('lesson.next'));
          setFeedbackButtonAction(() => () => handleNextQuestion(true));
        } else {
          setFeedbackButtonText(t('lesson.next'));
          setFeedbackButtonAction(() => () => completeLesson());
        }
      } else {
        // Incorrect answer
        setFeedbackMessage(t('lesson.incorrect-retry'));
        setFeedbackIcon(X);
        setFeedbackButtonText(t('lesson.retry'));
        setFeedbackButtonAction(() => () => handleNextQuestion(false));
      }

      setShowFeedbackOverlay(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedbackMessage('خطا در ارسال پاسخ. لطفاً دوباره تلاش کنید.');
      setFeedbackIcon(X);
      setFeedbackButtonText('تلاش مجدد');
      setFeedbackButtonAction(() => () => setShowFeedbackOverlay(false));
      setShowFeedbackOverlay(true);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = (isCorrect: boolean) => {
    setShowFeedbackOverlay(false);
    
    // Show level up modal if user leveled up
    if (isCorrect && levelUpData) {
      setShowLevelUpModal(true);
      return;
    }
    
    setSelectedAnswer(null);
    
    if (isCorrect && currentQuestion < lesson.quiz_questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
    // If incorrect, stay on the same question for retry
  };
  
  const handleLevelUpContinue = () => {
    setShowLevelUpModal(false);
    setLevelUpData(null);
    setSelectedAnswer(null);
    
    if (currentQuestion < lesson.quiz_questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeLesson();
    }
  };

  const completeLesson = async () => {
    if (!lesson) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Mark lesson as completed
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      // Refresh user progress to update the UI
      await refreshUserProgress();
      setCompleted(true);
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleNext = () => {
    navigate(`/course/${lesson?.course_id}`);
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-500 text-2xl">?</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Lesson not found
          </h3>
          <p className="text-gray-500">
            The lesson you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }


  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {t('lesson.correct')}
          </h1>
          
          <p className="text-gray-400 mb-6">
            +{lesson.xp_reward} XP
          </p>
          
          <button
            onClick={handleNext}
            className={clsx(
              'px-6 py-3 bg-orange-500 hover:bg-orange-600',
              'text-white font-semibold rounded-lg',
              'transition-all duration-200 transform hover:scale-105'
            )}
          >
            {t('lesson.next')}
          </button>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    const question = lesson.quiz_questions[currentQuestion];
    
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">
                  {currentQuestion + 1} / {lesson.quiz_questions.length}
                </span>
                <span className="text-sm text-orange-400">
                  +{lesson.xp_reward} XP
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / lesson.quiz_questions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-6">
              {language === 'fa' ? question.question_fa : question.question}
            </h2>

            <div className="space-y-3 mb-8">
              {(language === 'fa' ? question.options_fa : question.options).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={clsx(
                    'w-full p-4 text-left rounded-lg border transition-all duration-200',
                    selectedAnswer === index
                      ? 'bg-blue-600/30 border-blue-500 text-white'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800/70',
                    isRTL && 'text-right'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isSubmittingAnswer}
              className={clsx(
                'w-full py-3 px-4 bg-orange-500 hover:bg-orange-600',
                'text-white font-semibold rounded-lg',
                'transition-all duration-200 transform hover:scale-105',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              )}
            >
              {isSubmittingAnswer ? t('common.loading') : t('lesson.submit')}
            </button>
          </div>

          {/* Feedback Overlay */}
          {showFeedbackOverlay && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md mx-4 text-center">
                <div className={clsx(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                  feedbackIcon === Check ? 'bg-green-600' : 'bg-red-600'
                )}>
                  <feedbackIcon.type className="w-8 h-8 text-white" />
                </div>
                
                <p className="text-white text-lg mb-6 font-iransans">
                  {feedbackMessage}
                </p>
                
                <button
                  onClick={feedbackButtonAction}
                  className={clsx(
                    'px-6 py-3 bg-orange-500 hover:bg-orange-600',
                    'text-white font-semibold rounded-lg font-iransans',
                    'transition-all duration-200 transform hover:scale-105'
                  )}
                >
                  {feedbackButtonText}
                </button>
              </div>
            </div>
          )}
          
          {/* Level Up Modal */}
          {showLevelUpModal && levelUpData && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-600/20 border border-orange-500/30 rounded-xl p-8 max-w-md mx-4 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-white fill-current" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 font-iransans">
                  تبریک! سطح جدید!
                </h2>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-orange-400 mb-2 font-iransans">
                    سطح {levelUpData.newLevel}
                  </div>
                  <div className="text-lg text-purple-300 font-iransans">
                    {levelUpData.newRankTitle}
                  </div>
                </div>
                
                <button
                  onClick={handleLevelUpContinue}
                  className={clsx(
                    'px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-600',
                    'hover:from-orange-600 hover:to-purple-700',
                    'text-white font-bold rounded-lg font-iransans',
                    'transition-all duration-200 transform hover:scale-105',
                    'shadow-lg'
                  )}
                >
                  ادامه
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">
            {language === 'fa' ? lesson.title_fa : lesson.title}
          </h1>
          
          <div className={clsx(
            'prose prose-invert max-w-none mb-8',
            isRTL && 'prose-rtl'
          )}>
            <div 
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: (language === 'fa' ? lesson.content_fa : lesson.content)
                  .replace(/\n/g, '<br />')
              }}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleDidIt}
              className={clsx(
                'px-8 py-4 bg-orange-500 hover:bg-orange-600',
                'text-white font-semibold rounded-lg text-lg',
                'transition-all duration-200 transform hover:scale-105',
                'shadow-lg hover:shadow-orange-500/25'
              )}
            >
              {t('lesson.did-it')}
            </button>
            
            <p className="text-gray-400 text-sm mt-3">
              +{lesson.xp_reward} XP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}