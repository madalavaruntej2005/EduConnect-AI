import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  Sparkles,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const PostCard = ({ post, onPostUpdated }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic toggle
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.post(`/posts/${post.id}/like/`);
      setLikesCount(res.data.likes_count);
      setIsLiked(res.data.status === 'liked');
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      const res = await api.post(`/posts/${post.id}/save_post/`);
      setIsSaved(res.data.is_saved);
    } catch (err) {
      setIsSaved(prevSaved);
    }
  };

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      try {
        const res = await api.get(`/posts/${post.id}/comments/`);
        setComments(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${post.id}/comments/`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/#post-${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Author header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <img
            src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={post.author?.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {post.author?.first_name ? `${post.author.first_name} ${post.author.last_name}` : post.author?.username}
              </h4>
              <Badge variant="primary" size="sm">
                {post.post_type}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {post.author?.headline || 'Student @ EduConnect'} • {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Text */}
      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-3">
        {post.content}
      </p>

      {/* Media gallery */}
      {post.media && post.media.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-800">
          <img
            src={post.media[0].file_url}
            alt="Post media"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Hashtag tags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-semibold transition-colors ${
              isLiked ? 'text-rose-500' : 'hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count || comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`p-1.5 rounded-lg transition-colors ${
            isSaved ? 'text-indigo-600 dark:text-indigo-400' : 'hover:text-indigo-600'
          }`}
          title={isSaved ? 'Saved to bookmarks' : 'Save post'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Comment list */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={c.author?.avatar}
                    alt={c.author?.username}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 flex-1 border border-slate-100 dark:border-slate-700/60">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{c.author?.username}</p>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          {user && (
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a constructive comment..."
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </Card>
  );
};
