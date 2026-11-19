import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, UserPlus, Users, Trophy, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const SidebarRight = ({ className = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [streak, setStreak] = useState(14);

  useEffect(() => {
    const loadWidgets = async () => {
      try {
        const [connRes, commRes, profRes] = await Promise.allSettled([
          api.get('/connections/suggestions/'),
          api.get('/communities/'),
          api.get('/profiles/me/'),
        ]);

        if (connRes.status === 'fulfilled' && connRes.value?.data) {
          setSuggestions(connRes.value.data.slice(0, 4));
        }
        if (commRes.status === 'fulfilled' && commRes.value?.data) {
          const list = commRes.value.data.results || commRes.value.data;
          setCommunities(list.slice(0, 3));
        }
        if (profRes.status === 'fulfilled' && profRes.value?.data?.streak_count) {
          setStreak(profRes.value.data.streak_count);
        }
      } catch (err) {
        console.debug('Widget loading:', err);
      }
    };
    loadWidgets();
  }, []);

  const handleConnect = async (userId) => {
    try {
      await api.post('/connections/send_request/', { user_id: userId });
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
    } catch (err) {
      console.error('Failed to send connection request:', err);
    }
  };

  return (
    <aside className={`w-80 shrink-0 hidden lg:block ${className}`}>
      <div className="sticky top-20 space-y-6">
        {/* Streak & Reputation Widget */}
        <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border-amber-200/50 dark:border-amber-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Study Streak
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{streak} Days Active</h4>
              </div>
            </div>
            <Trophy className="w-6 h-6 text-amber-500/60" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
            Complete a quiz or watch a lesson today to maintain your streak bonus!
          </p>
        </Card>

        {/* Suggested Connections */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              Suggested Students
            </h4>
            <Link to="/explore" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              See all
            </Link>
          </div>

          <div className="space-y-3.5">
            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-400">No new connection suggestions.</p>
            ) : (
              suggestions.map((student) => (
                <div key={student.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={student.username}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {student.first_name ? `${student.first_name} ${student.last_name}` : student.username}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {student.headline || 'Student @ EduConnect'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs py-1 px-2.5 rounded-lg"
                    onClick={() => handleConnect(student.id)}
                  >
                    Connect
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Trending Communities */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Trending Clubs
            </h4>
            <Link to="/communities" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Explore
            </Link>
          </div>

          <div className="space-y-3">
            {communities.map((comm) => (
              <Link
                key={comm.id}
                to="/communities"
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <img
                  src={comm.avatar || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&auto=format&fit=crop&q=80'}
                  alt={comm.name}
                  className="w-9 h-9 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {comm.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{comm.members_count} members</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </aside>
  );
};
