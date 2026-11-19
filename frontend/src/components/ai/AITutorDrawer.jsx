import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Code,
  BookOpen,
  HelpCircle,
  Briefcase,
  FileText,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MODES = [
  { id: 'TUTOR', label: 'Concept Tutor', icon: BookOpen, promptHint: 'Ask to explain any concept simply (e.g. Paxos consensus, dynamic programming)...' },
  { id: 'DEBUGGER', label: 'Code Debugger', icon: Code, promptHint: 'Paste code or stack traces to diagnose and fix bugs...' },
  { id: 'SUMMARIZER', label: 'Notes Summarizer', icon: FileText, promptHint: 'Paste study notes, textbook excerpts or lecture transcripts to summarize...' },
  { id: 'QUIZ_GEN', label: 'Quiz Generator', icon: HelpCircle, promptHint: 'Enter a topic to generate 3-5 multiple-choice practice questions...' },
  { id: 'CAREER_COACH', label: 'Career Coach', icon: Briefcase, promptHint: 'Ask for resume feedback, interview prep, or project ideas...' },
];

export const AITutorDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState('TUTOR');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && user) {
      loadOrCreateConversation();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadOrCreateConversation = async () => {
    try {
      const res = await api.get('/ai/');
      const list = res.data.results || res.data || [];
      const match = list.find((c) => c.context_mode === mode);

      if (match) {
        setActiveConversation(match);
        setMessages(match.messages || []);
      } else {
        const createRes = await api.post('/ai/', {
          title: `${MODES.find((m) => m.id === mode)?.label} Session`,
          context_mode: mode,
        });
        setActiveConversation(createRes.data);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to load AI conversations:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading || !activeConversation) return;

    const userText = prompt.trim();
    setPrompt('');
    setLoading(true);

    // Optimistic user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/ai/${activeConversation.id}/ask/`, {
        prompt: userText,
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.data.user_message,
        res.data.assistant_message,
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please ensure the backend server is reachable.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentModeInfo = MODES.find((m) => m.id === mode);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  EduConnect AI Tutor
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Autonomous Academic Co-Pilot</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector Chips */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto bg-white dark:bg-slate-900">
            {MODES.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {currentModeInfo?.label} is ready!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  {currentModeInfo?.promptHint}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-none p-3 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>AI Tutor is formulating explanation...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl px-3 py-1.5 border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentModeInfo?.promptHint || 'Ask a question...'}
                className="flex-1 bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 py-1.5"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
