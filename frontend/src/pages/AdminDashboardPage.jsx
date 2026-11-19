import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Briefcase,
  Sparkles,
  AlertOctagon,
  CheckCircle,
  ExternalLink,
  Radio,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, repRes, intRes] = await Promise.allSettled([
        api.get('/analytics/overview/'),
        api.get('/moderation/reports/'),
        api.get('/integrations/platform_status/'),
      ]);

      if (statsRes.status === 'fulfilled') setOverview(statsRes.value.data);
      if (repRes.status === 'fulfilled') setReports(repRes.value.data.results || repRes.value.data || []);
      if (intRes.status === 'fulfilled') setIntegrations(intRes.value.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      await api.post(`/moderation/reports/${reportId}/resolve/`, { action_taken: actionTaken });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to resolve report:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-black tracking-tight">Platform Administration & Moderation</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Global management of user roles, campus safety, content moderation queues, and official API integration adapters.
          </p>
        </div>
      </div>

      {/* Metric Counters */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" /> Registered Students
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {overview.metrics?.total_students || 0}
            </h3>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Posts Created
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {overview.metrics?.total_posts || 0}
            </h3>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Active Courses
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {overview.metrics?.total_courses || 0}
            </h3>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Sessions
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {overview.metrics?.ai_learning_sessions || 0}
            </h3>
          </Card>
        </div>
      )}

      {/* External Platform Integrations Status */}
      {integrations && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              Official External Platform Integrations
            </h3>
            <span className="text-xs text-slate-400">OAuth & API Keys</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(integrations).map(([key, item]) => (
              <div key={key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                  <Badge variant={item.configured ? 'success' : 'default'} size="sm">
                    {item.configured ? 'Configured' : 'Awaiting Config'}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.notes}</p>
                {item.auth_url && (
                  <a
                    href={item.auth_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                  >
                    Authorize Account <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Moderation Queue */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-500" />
          Content Moderation Queue ({reports.length})
        </h3>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">
              No pending content policy reports. Community guidelines compliance is 100%!
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">{report.reason}</Badge>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Target: {report.content_type} (#{report.target_id?.substring(0, 8)})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Reported by {report.reporter?.username} • Status: <span className="font-semibold">{report.status}</span>
                  </p>
                </div>

                {report.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleResolveReport(report.id, 'Dismissed as safe')}>
                      Dismiss
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleResolveReport(report.id, 'Content removed by admin')}>
                      Remove Content
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
