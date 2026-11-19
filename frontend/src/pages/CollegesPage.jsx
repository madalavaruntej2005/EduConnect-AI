import React, { useState, useEffect } from 'react';
import { GraduationCap, MapPin, Globe, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const CollegesPage = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get('/colleges/');
        setColleges(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to load colleges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const filtered = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white shadow-lg space-y-2">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-emerald-300" />
          Partner Colleges & Universities
        </h2>
        <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
          Verified academic institutions powering campus communities, student clubs, and official departmental courseware.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by college name, code, or city..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
        />
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((college) => (
          <Card key={college.id} hover className="space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={college.logo || 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80'}
                alt={college.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {college.name}
                  </h4>
                  {college.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </div>

                <Badge variant="default" size="sm" className="mt-1">
                  Code: {college.code}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {college.description || 'Premier educational university partner.'}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {college.city}, {college.state}
              </span>

              {college.domain && (
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                  <Globe className="w-3.5 h-3.5" /> {college.domain}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
