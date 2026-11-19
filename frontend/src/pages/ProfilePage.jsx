import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Github,
  Linkedin,
  Globe,
  Edit3,
  Flame,
  CheckCircle2,
  Calendar,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { PostCard } from '../components/feed/PostCard';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profRes, postRes] = await Promise.allSettled([
        api.get('/profiles/me/'),
        user ? api.get(`/posts/?author_id=${user.id}`) : Promise.resolve({ data: [] }),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data) {
        setProfile(profRes.value.data);
        setHeadline(profRes.value.data.user?.headline || '');
        setBio(profRes.value.data.user?.bio || '');
        setAvatar(profRes.value.data.user?.avatar || '');
        setSkills(profRes.value.data.skills || []);
      }
      if (postRes.status === 'fulfilled') {
        setMyPosts(postRes.value.data.results || postRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update user model
      const userRes = await api.patch('/auth/me/', { headline, bio, avatar });
      updateProfile(userRes.data);

      // 2. Update student profile model
      await api.patch('/profiles/me/', { skills });

      setShowEditModal(false);
      fetchProfileData();
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <Card className="p-0 overflow-hidden">
        {/* Banner */}
        <div className="h-44 w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 relative">
          <img
            src={user?.banner || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80'}
            alt="Banner"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Profile Info Row */}
        <div className="p-6 relative">
          {/* Avatar floating */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 mb-4 gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.username}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl"
            />
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => setShowEditModal(true)}
              className="self-start sm:self-auto"
            >
              Edit Profile
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </h2>
              <Badge variant="primary" size="sm">
                {user?.role}
              </Badge>
              {user?.is_verified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              {user?.headline || 'Student @ EduConnect AI'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                {profile?.college_details?.name || 'Top Engineering University'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Class of {profile?.graduation_year || 2026}
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Flame className="w-4 h-4 fill-current" />
                {profile?.streak_count || 14} Day Streak
              </span>
            </div>

            {user?.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Skills & Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Verified Skills */}
        <Card className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Skills & Technologies
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400">No skills added yet.</p>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </Card>

        {/* Milestones & Badges */}
        <Card className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Verified Academic Badges
          </h4>
          <div className="space-y-2">
            {(profile?.badges || ["Dean's List 2025", "14-Day Study Streak", "Hackathon Winner"]).map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Student Posts Tab */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          Published Learning Posts ({myPosts.length})
        </h3>
        {myPosts.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            You haven't posted any updates yet. Share your study notes or questions on the Home feed!
          </Card>
        ) : (
          myPosts.map((post) => <PostCard key={post.id} post={post} onPostUpdated={fetchProfileData} />)
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Academic Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input label="Headline / Tagline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. CS Junior @ MIT | Building AI Systems" />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Input label="Avatar Image URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} />

          {/* Add skill row */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. PyTorch)..."
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              />
              <Button variant="secondary" size="sm" onClick={handleAddSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="text-slate-400 hover:text-rose-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
