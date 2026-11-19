import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { SidebarLeft } from './components/navigation/SidebarLeft';
import { SidebarRight } from './components/navigation/SidebarRight';
import { BottomNav } from './components/navigation/BottomNav';
import { AITutorDrawer } from './components/ai/AITutorDrawer';

// Pages
import { FeedPage } from './pages/FeedPage';
import { ExplorePage } from './pages/ExplorePage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { LearningPage } from './pages/LearningPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { MessagingPage } from './pages/MessagingPage';
import { CareersPage } from './pages/CareersPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProfilePage } from './pages/ProfilePage';
import { CollegesPage } from './pages/CollegesPage';
import { GuardianDashboardPage } from './pages/GuardianDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App = () => {
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Hide 3-column right sidebar on full-width tool pages (Messages, Guardian, Admin, Course Player)
  const isFullWidthPage =
    location.pathname.startsWith('/messages') ||
    location.pathname.startsWith('/guardian') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/learning/courses/') ||
    location.pathname.startsWith('/projects');

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenAITutor={() => setIsAITutorOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8 flex gap-6">
        {/* Left Navigation Sidebar */}
        {!isAuthPage && (
          <SidebarLeft
            onOpenAITutor={() => setIsAITutorOpen(true)}
            className={isMobileMenuOpen ? '!block fixed inset-0 z-50 bg-white dark:bg-slate-900 p-6 pt-20' : ''}
          />
        )}

        {/* Center Content Area */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/courses/:id" element={<CourseDetailPage />} />
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/colleges" element={<CollegesPage />} />
            <Route path="/guardian" element={<GuardianDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>

        {/* Right Sidebar (Feeds, Connections, Streaks) */}
        {!isAuthPage && !isFullWidthPage && <SidebarRight />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isAuthPage && <BottomNav onOpenAITutor={() => setIsAITutorOpen(true)} />}

      {/* Slide-over AI Academic Tutor Drawer */}
      <AITutorDrawer isOpen={isAITutorOpen} onClose={() => setIsAITutorOpen(false)} />
    </div>
  );
};
