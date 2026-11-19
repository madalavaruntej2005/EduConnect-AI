import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Users,
  User as UserIcon,
  Circle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';

export const MessagingPage = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/chat/');
      const list = res.data.results || res.data || [];
      setRooms(list);
      if (list.length > 0 && !activeRoom) {
        setActiveRoom(list[0]);
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await api.get(`/chat/${roomId}/messages/`);
      setMessages(res.data.results || res.data || []);
      // Mark as read
      await api.post(`/chat/${roomId}/mark_read/`);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);

      // Connect WebSocket if supported
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${activeRoom.id}/`;

      try {
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            setMessages((prev) => [
              ...prev,
              {
                id: 'ws-' + Date.now(),
                sender: { id: data.sender_id, username: data.sender_username },
                content: data.content,
                attachment_url: data.attachment_url,
                created_at: new Date().toISOString(),
              },
            ]);
          }
        };
        wsRef.current = ws;
      } catch (e) {
        console.debug('WebSocket fallback to REST:', e);
      }

      return () => {
        if (wsRef.current) wsRef.current.close();
      };
    }
  }, [activeRoom?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachmentUrl) || !activeRoom) return;

    const payload = {
      content: messageInput.trim(),
      attachment_url: attachmentUrl.trim(),
      attachment_type: attachmentUrl ? 'IMAGE' : '',
    };

    setMessageInput('');
    setAttachmentUrl('');
    setShowAttachInput(false);

    try {
      const res = await api.post(`/chat/${activeRoom.id}/messages/`, payload);
      setMessages((prev) => [...prev, res.data]);

      // Broadcast over WS if open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat_message',
            content: payload.content,
            attachment_url: payload.attachment_url,
          })
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const openNewChat = async () => {
    setShowNewChatModal(true);
    try {
      const res = await api.get('/users/');
      setUserList(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load users for new chat:', err);
    }
  };

  const startDirectChat = async (targetUserId) => {
    try {
      const res = await api.post('/chat/direct/', { user_id: targetUserId });
      setShowNewChatModal(false);
      setActiveRoom(res.data);
      fetchRooms();
    } catch (err) {
      console.error('Failed to start direct message:', err);
    }
  };

  const getPartnerName = (room) => {
    if (room.room_type === 'GROUP') return room.name;
    const partner = room.members?.find((m) => m.user?.id !== user?.id)?.user;
    return partner ? (partner.first_name ? `${partner.first_name} ${partner.last_name}` : partner.username) : room.name;
  };

  const getPartnerAvatar = (room) => {
    if (room.room_type === 'GROUP') return room.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80';
    const partner = room.members?.find((m) => m.user?.id !== user?.id)?.user;
    return partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8.5rem)] flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
      {/* Left Column: Rooms Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Messages
          </h3>
          <button
            onClick={openNewChat}
            className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations yet. Click + to start a chat!
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = activeRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={getPartnerAvatar(room)}
                      alt={room.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-indigo-500/20"
                    />
                    <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 absolute bottom-0 right-0 ring-2 ring-white dark:ring-slate-900 rounded-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {getPartnerName(room)}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {room.latest_message ? new Date(room.latest_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {room.latest_message?.content || 'No messages yet'}
                    </p>
                  </div>

                  {room.unread_count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {room.unread_count}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/20">
        {activeRoom ? (
          <>
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getPartnerAvatar(activeRoom)}
                  alt="Active Partner"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {getPartnerName(activeRoom)}
                  </h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Online & Active
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMe = m.sender?.id === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed space-y-1.5 shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                          {m.sender?.username}
                        </p>
                      )}

                      {m.content && <p>{m.content}</p>}

                      {m.attachment_url && (
                        <div className="rounded-xl overflow-hidden mt-1.5">
                          <img src={m.attachment_url} alt="Attachment" className="max-h-60 w-full object-cover" />
                        </div>
                      )}

                      <div className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment preview / input if expanded */}
            {showAttachInput && (
              <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <input
                  type="text"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="Paste image / file URL to attach..."
                  className="w-full text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAttachInput(!showAttachInput)}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Attach file / image"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              />

              <button
                type="submit"
                disabled={!messageInput.trim() && !attachmentUrl}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Select a conversation or start a new chat</p>
          </div>
        )}
      </div>

      {/* Start New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Start Direct Message"
      >
        <div className="space-y-4">
          <Input
            placeholder="Search student or mentor by username..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            icon={Search}
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {userList
              .filter((u) => u.id !== user?.id && (!searchUserQuery || u.username.toLowerCase().includes(searchUserQuery.toLowerCase())))
              .map((u) => (
                <div
                  key={u.id}
                  onClick={() => startDirectChat(u.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.username}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                      </p>
                      <p className="text-[10px] text-slate-400">{u.headline || u.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                    Chat
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
