import React, { useState } from 'react';
import { Image, Video, Sparkles, Hash, Globe, Lock } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('TEXT');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    const payload = {
      content: content.trim(),
      post_type: postType,
      visibility: visibility,
      media: mediaUrl ? [{ file_url: mediaUrl, media_type: postType === 'VIDEO' || postType === 'SHORT' ? 'VIDEO' : 'IMAGE' }] : []
    };

    try {
      await api.post('/posts/', payload);
      setContent('');
      setMediaUrl('');
      setPostType('TEXT');
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish post. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Learning Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Post Type Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {[
            { id: 'TEXT', label: 'Discussion' },
            { id: 'IMAGE', label: 'Photo' },
            { id: 'SHORT', label: 'Reel / Short' },
            { id: 'ARTICLE', label: 'Article' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPostType(t.id)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                postType === t.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an insight, question, study note, or project milestone... (Type #tags to categorize)"
          className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
          required
        />

        {/* Media URL if not just text */}
        {(postType === 'IMAGE' || postType === 'SHORT' || postType === 'VIDEO') && (
          <Input
            label="Media Asset URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or https://..."
            icon={postType === 'SHORT' ? Video : Image}
          />
        )}

        {/* Visibility Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="PUBLIC">Public — All Students</option>
              <option value="COLLEGE">My College Only</option>
              <option value="CONNECTIONS">Connections Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              Publish Post
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
