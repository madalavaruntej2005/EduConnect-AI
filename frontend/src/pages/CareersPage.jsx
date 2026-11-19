import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Search,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';

export const CareersPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('https://example.com/student_resume.pdf');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jRes, aRes] = await Promise.allSettled([
        api.get('/jobs/'),
        user ? api.get('/jobs/my-applications/') : Promise.resolve({ data: [] }),
      ]);
      setJobs(jRes.status === 'fulfilled' ? jRes.value.data.results || jRes.value.data || [] : []);
      setMyApplications(aRes.status === 'fulfilled' ? aRes.value.data.results || aRes.value.data || [] : []);
    } catch (err) {
      console.error('Failed to load career listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${selectedJob.id}/apply/`, {
        resume_url: resumeUrl,
        cover_letter: coverLetter,
      });
      setSuccessMessage('Application successfully submitted! You can track its status below.');
      setShowApplyModal(false);
      fetchJobs();
    } catch (err) {
      console.error('Failed to submit application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesType = filterType === 'ALL' || j.job_type === filterType;
    const matchesSearch =
      !searchQuery ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Careers Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white shadow-lg space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
          EduConnect Talent & Careers
        </span>
        <h2 className="text-2xl font-black tracking-tight">University Internships & Graduate Engineering Roles</h2>
        <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
          Direct recruitment pipeline for students. Apply with verified academic portfolios, coursework, and GitHub projects.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="font-bold">×</button>
        </div>
      )}

      {/* My Applications Tracker (if any) */}
      {myApplications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            My Active Applications ({myApplications.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myApplications.map((app) => (
              <Card key={app.id} className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{app.job?.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.job?.company_name}</p>
                  <span className="text-[10px] text-slate-400 mt-1 inline-block">
                    Applied on {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant={app.status === 'OFFERED' ? 'success' : 'primary'} size="sm">
                  {app.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'ALL' ? 'All Opportunities' : t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or companies..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No job listings found"
            description="Check back soon! Recruiters from Google, Stripe, and partner institutions regularly post new openings."
          />
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} hover className="transition-all hover:border-indigo-300 dark:hover:border-indigo-800 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={job.company_logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                    alt={job.company_name}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{job.title}</h4>
                      <Badge variant="primary" size="sm">{job.job_type}</Badge>
                      <Badge variant="default" size="sm">{job.workplace_type}</Badge>
                    </div>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                      {job.company_name} • <span className="text-slate-400 font-normal">{job.location}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5" /> {job.salary_range}
                      </span>
                      <span>•</span>
                      <span>{job.applications_count} applicants</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {job.has_applied ? (
                    <Badge variant="success" size="md">Applied</Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyModal(true);
                      }}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Description preview */}
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                {job.description}
              </p>

              {/* Skill chips */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Apply Modal */}
      {selectedJob && (
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title={`Apply to ${selectedJob.title} @ ${selectedJob.company_name}`}
        >
          <form onSubmit={handleApply} className="space-y-4">
            <Input
              label="Resume / Portfolio PDF URL"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://..."
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Cover Note / Pitch (Optional)
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a great candidate for this role? Highlight your coursework and projects..."
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
