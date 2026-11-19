import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Compass, Film, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StoriesTray } from '../components/stories/StoriesTray';
import { PostCard } from '../components/feed/PostCard';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedMode, setFeedMode] = useState('for_you'); // for_you, trending, shorts
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/feed/?mode=${feedMode}`);
      const list = res.data.results || res.data || [];
      setPosts(list);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [feedMode]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 24-Hour Stories Tray */}
      <StoriesTray />

      {/* Post Creator Trigger Card */}
      {user && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-xs font-medium transition-colors"
          >
            What are you learning, building, or researching today?
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={PlusCircle}
            className="shrink-0"
          >
            Post
          </Button>
        </div>
      )}

      {/* Feed Filters Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'for_you', label: 'For You', icon: Sparkles },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'shorts', label: 'Short Reels', icon: Film },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = feedMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFeedMode(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Posts Stream */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No posts in this feed yet"
          description="Be the first to share an insight, study question, or project update with fellow students!"
          actionText="Create First Post"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchFeed} />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={fetchFeed}
      />
    </div>
  );
};
