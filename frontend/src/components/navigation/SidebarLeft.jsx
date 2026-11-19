import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  BookOpen,
  MessageSquare,
  Briefcase,
  FolderGit2,
  Sparkles,
  Activity,
  User,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SidebarLeft = ({ onOpenAITutor, className = '' }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Home Feed', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Communities', path: '/communities', icon: Users },
    { label: 'Learning Hub', path: '/learning', icon: BookOpen },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Careers & Jobs', path: '/careers', icon: Briefcase },
    { label: 'Projects & Teams', path: '/projects', icon: FolderGit2 },
    { label: 'Colleges', path: '/colleges', icon: GraduationCap },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'AI Guardian', path: '/guardian', icon: Activity, highlight: true },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Platform Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className={`w-64 shrink-0 hidden md:block ${className}`}>
      <div className="sticky top-20 space-y-6">
        {/* Navigation list */}
        <nav className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  } ${item.highlight ? 'text-emerald-600 dark:text-emerald-400' : ''}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* AI Tutor Card callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md shadow-indigo-500/20 space-y-3 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h4 className="text-sm font-bold">EduConnect AI Tutor</h4>
          </div>
          <p className="text-xs text-indigo-100/90 leading-relaxed">
            Need concept clarity, code debugging, or custom practice quizzes?
          </p>
          <button
            onClick={onOpenAITutor}
            className="w-full py-2 px-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Open AI Assistant
          </button>
        </div>
      </div>
    </aside>
  );
};
