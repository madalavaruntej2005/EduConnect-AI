import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock, Award, PlayCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';

export const LearningPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');

  const fetchLearningData = async () => {
    setLoading(true);
    try {
      const coursePromise = api.get('/courses/');
      const enrollPromise = user ? api.get('/courses/my-enrollments/') : Promise.resolve({ data: [] });

      const [cRes, eRes] = await Promise.all([coursePromise, enrollPromise]);
      setCourses(cRes.data.results || cRes.data || []);
      setMyEnrollments(eRes.data.results || eRes.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, [user]);

  const filtered = courses.filter((c) => {
    if (category === 'ALL') return true;
    return c.category?.toLowerCase() === category.toLowerCase();
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-lg space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
          EduConnect Learning Hub
        </span>
        <h2 className="text-2xl font-black tracking-tight">Structured Courses & Video Tutorials</h2>
        <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
          Watch interactive modular video lessons, test your understanding with instant quizzes, and earn verifiable skill badges.
        </p>
      </div>

      {/* Enrolled Courses Progress Section (if enrolled) */}
      {myEnrollments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-emerald-500" />
            Continue Learning ({myEnrollments.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4 space-y-3 border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10">
                <div className="flex items-center justify-between">
                  <Badge variant={enrollment.is_completed ? 'success' : 'primary'} size="sm">
                    {enrollment.is_completed ? 'Completed' : `${enrollment.progress_percent}% Complete`}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    Last active: {new Date(enrollment.last_accessed).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {enrollment.course?.title}
                </h4>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress_percent}%` }}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Link to={`/learning/courses/${enrollment.course?.id}`}>
                    <Button variant="primary" size="sm" className="text-xs">
                      Resume Course
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {['ALL', 'Computer Science', 'Machine Learning', 'Web Development', 'Algorithms'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {cat === 'ALL' ? 'All Catalog' : cat}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Link key={course.id} to={`/learning/courses/${course.id}`} className="group">
              <Card hover className="h-full flex flex-col justify-between overflow-hidden">
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="primary" size="sm" className="bg-slate-900/80 text-white border-none backdrop-blur-md">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {course.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {course.duration_hours}h
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" /> {course.rating}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
