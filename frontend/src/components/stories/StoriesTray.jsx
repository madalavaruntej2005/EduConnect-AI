import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const StoriesTray = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories/');
      setStories(res.data.results || res.data || []);
    } catch (err) {
      console.debug('Failed to fetch stories:', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleOpenStory = async (story) => {
    setSelectedStory(story);
    try {
      await api.post(`/stories/${story.id}/view_story/`);
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, has_viewed: true } : s))
      );
    } catch (err) {
      console.debug('Failed to record story view:', err);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newMediaUrl) return;

    setIsSubmitting(true);
    try {
      await api.post('/stories/', {
        media_url: newMediaUrl,
        media_type: 'IMAGE',
        caption: newCaption,
      });
      setShowCreateModal(false);
      setNewMediaUrl('');
      setNewCaption('');
      fetchStories();
    } catch (err) {
      console.error('Failed to create story:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-x-auto transition-colors">
      <div className="flex items-center gap-4 min-w-max">
        {/* Add Story Button for current user */}
        {user && (
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => setShowCreateModal(true)}>
            <div className="relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user.username}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 p-0.5"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Your Story</span>
          </div>
        )}

        {/* Stories List */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => handleOpenStory(story)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div
              className={`p-0.5 rounded-full ${
                story.has_viewed
                  ? 'ring-2 ring-slate-300 dark:ring-slate-700'
                  : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 ring-2 ring-transparent'
              } group-hover:scale-105 transition-transform`}
            >
              <div className="p-0.5 bg-white dark:bg-slate-900 rounded-full">
                <img
                  src={story.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={story.author?.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[68px] truncate">
              {story.author?.username}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Top Bar with author and close */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedStory.author?.avatar}
                  alt={selectedStory.author?.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-white">{selectedStory.author?.username}</p>
                  <p className="text-[10px] text-white/70">
                    Expires in {Math.max(1, Math.round((new Date(selectedStory.expires_at) - new Date()) / 3600000))} hrs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="p-1 rounded-full bg-black/40 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media */}
            <div className="h-[460px] w-full flex items-center justify-center bg-black">
              <img
                src={selectedStory.media_url}
                alt="Story content"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Caption */}
            {selectedStory.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-xs text-white leading-relaxed">{selectedStory.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Share an Ephemeral Story (24h)"
      >
        <form onSubmit={handleCreateStory} className="space-y-4">
          <Input
            label="Image / Media URL"
            value={newMediaUrl}
            onChange={(e) => setNewMediaUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            required
          />
          <Input
            label="Caption (Optional)"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Late night coding sprint! ☕"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Share Story
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
