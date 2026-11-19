import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Check, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

export const CommunitiesPage = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Artificial Intelligence');
  const [avatar, setAvatar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communities/');
      setCommunities(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoinToggle = async (comm) => {
    if (!user) return;
    try {
      if (comm.is_member) {
        await api.post(`/communities/${comm.id}/leave/`);
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === comm.id ? { ...c, is_member: false, members_count: Math.max(0, c.members_count - 1) } : c
          )
        );
      } else {
        await api.post(`/communities/${comm.id}/join/`);
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === comm.id ? { ...c, is_member: true, members_count: c.members_count + 1 } : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle membership:', err);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!name || !description) return;

    setIsSubmitting(true);
    try {
      await api.post('/communities/', {
        name,
        description,
        category,
        avatar: avatar || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&auto=format&fit=crop&q=80',
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      fetchCommunities();
    } catch (err) {
      console.error('Failed to create community:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = communities.filter((c) => {
    const matchesCat = categoryFilter === 'ALL' || c.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Student Communities & Clubs
          </h2>
          <p className="text-xs text-indigo-100 max-w-md mt-1">
            Join academic clubs, study groups, and hackathon teams across campuses.
          </p>
        </div>

        {user && (
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 font-bold"
          >
            Start a Community
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {['ALL', 'Artificial Intelligence', 'Web Development', 'Computer Science', 'Data Science'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Clubs' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Community Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No communities match your criteria"
          description="Try selecting another category or be the pioneer to start this student club!"
          actionText="Create Community"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((comm) => (
            <Card key={comm.id} className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={comm.avatar || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80'}
                    alt={comm.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-indigo-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <Badge variant="primary" size="sm">
                      {comm.category}
                    </Badge>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                      {comm.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {comm.members_count} members • Founded by {comm.creator?.username || 'Student'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {comm.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-3">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {comm.posts_count || 0} active posts
                </span>

                <Button
                  variant={comm.is_member ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleJoinToggle(comm)}
                  className="text-xs px-3 py-1"
                >
                  {comm.is_member ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Joined
                    </span>
                  ) : (
                    'Join Club'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Start a Student Community"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-4">
          <Input
            label="Community Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Stanford Autonomous Systems Guild"
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Web Development">Web Development</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Competitive Coding">Competitive Coding</option>
              <option value="Robotics">Robotics & Hardware</option>
              <option value="Open Source">Open Source Software</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the mission of this community? What will members learn and build?"
              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <Input
            label="Avatar Image URL (Optional)"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Create Community
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
