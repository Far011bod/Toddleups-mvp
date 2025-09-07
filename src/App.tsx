import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { ProtectedLayout } from './components/ProtectedLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { CoursePage } from './pages/CoursePage';
import { LessonPlayer } from './pages/LessonPlayer';
import { Leaderboard } from './pages/Leaderboard';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <Layout showNav={false} showFooter={false}>
                    <LandingPage />
                  </Layout>
                } 
              />
              <Route 
                path="/auth" 
                element={
                  <Layout showNav={false} showFooter={false}>
                    <AuthPage />
                  </Layout>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                } 
              />
              <Route 
                path="/course/:courseId" 
                element={
                  <ProtectedLayout>
                    <CoursePage />
                  </ProtectedLayout>
                } 
              />
              <Route 
                path="/lesson/:lessonId" 
                element={
                  <ProtectedLayout>
                    <LessonPlayer />
                  </ProtectedLayout>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedLayout>
                    <Leaderboard />
                  </ProtectedLayout>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedLayout showNav={false}>
                    <ProfilePage />
                  </ProtectedLayout>
                } 
              />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;