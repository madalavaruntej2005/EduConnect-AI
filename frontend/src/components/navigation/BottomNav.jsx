import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, BookOpen, MessageSquare, User, Sparkles } from 'lucide-react';

export const BottomNav = ({ onOpenAITutor }) => {
  const navItems = [
    { label: 'Feed', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Learn', path: '/learning', icon: BookOpen },
    { label: 'Chat', path: '/messages', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      {/* Floating AI Launcher */}
      <button
        onClick={onOpenAITutor}
        className="flex flex-col items-center gap-1 py-1 px-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>AI</span>
      </button>
    </div>
  );
};
