import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, BookOpen, GraduationCap, Compass, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all'); // all, students, courses, communities, colleges
  const [results, setResults] = useState({
    students: [],
    courses: [],
    communities: [],
    colleges: [],
  });
  const [loading, setLoading] = useState(false);

  const executeSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const qParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const [uRes, cRes, commRes, colRes] = await Promise.allSettled([
        api.get(`/users/${qParam}`),
        api.get(`/courses/${qParam}`),
        api.get(`/communities/${qParam}`),
        api.get(`/colleges/${qParam}`),
      ]);

      setResults({
        students: uRes.status === 'fulfilled' ? uRes.value.data.results || uRes.value.data || [] : [],
        courses: cRes.status === 'fulfilled' ? cRes.value.data.results || cRes.value.data || [] : [],
        communities: commRes.status === 'fulfilled' ? commRes.value.data.results || commRes.value.data || [] : [],
        colleges: colRes.status === 'fulfilled' ? colRes.value.data.results || colRes.value.data || [] : [],
      });
    } catch (err) {
      console.error('Explore search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    executeSearch(query);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 text-white shadow-lg space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Explore EduConnect Ecosystem</h2>
          <p className="text-xs text-indigo-100 max-w-lg mt-1">
            Discover peer students, university clubs, video courses, and research mentors across all campuses.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, skill (Python, React), subject, or university (MIT, Stanford)..."
            className="w-full pl-11 pr-24 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            loading={loading}
          >
            Search
          </Button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Results' },
          { id: 'students', label: `Students (${results.students.length})` },
          { id: 'courses', label: `Courses (${results.courses.length})` },
          { id: 'communities', label: `Communities (${results.communities.length})` },
          { id: 'colleges', label: `Colleges (${results.colleges.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Students Results */}
      {(activeTab === 'all' || activeTab === 'students') && results.students.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Students & Mentors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.students.map((student) => (
              <Card key={student.id} className="flex items-center gap-3 hover:border-indigo-300 transition-all">
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={student.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {student.first_name ? `${student.first_name} ${student.last_name}` : student.username}
                    </p>
                    <Badge variant="primary" size="sm">
                      {student.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {student.headline || 'Student at EduConnect'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Courses Results */}
      {(activeTab === 'all' || activeTab === 'courses') && results.courses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Learning Courses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.courses.map((course) => (
              <Link key={course.id} to={`/learning/courses/${course.id}`}>
                <Card hover className="h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <Badge variant="success" size="sm">{course.difficulty}</Badge>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {course.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <span>{course.duration_hours}h total</span>
                    <span className="font-bold text-amber-500">★ {course.rating}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Communities Results */}
      {(activeTab === 'all' || activeTab === 'communities') && results.communities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Student Communities & Clubs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.communities.map((comm) => (
              <Link key={comm.id} to="/communities">
                <Card hover className="flex items-center gap-3">
                  <img
                    src={comm.avatar}
                    alt={comm.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{comm.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{comm.description}</p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-block">
                      {comm.members_count} active members
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
