import React, { useState, useRef } from 'react';
import { Bell, Trash2, Check, AlertCircle, Info, Sparkles, FileText, Loader2, CheckCheck, Filter } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '../api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../components/layout/AppLayout';

const getIcon = (type) => {
  switch (type) {
    case 'transcription_done': return <FileText size={16} className="text-blue-400" />;
    case 'summary_done': return <Sparkles size={16} className="text-emerald-400" />;
    case 'bot_failed': return <AlertCircle size={16} className="text-red-400" />;
    default: return <Info size={16} className="text-indigo-400" />;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [lastKey, setLastKey] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const scrollRef = useRef(null);

  const { data: notificationsRes, isFetching } = useGetNotificationsQuery({ limit: 20, lastKey });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const allNotifications = notificationsRes?.data?.results || [];
  const unreadCount = notificationsRes?.data?.unread_count || 0;
  const nextKey = notificationsRes?.data?.last_key;

  const notifications = allNotifications
    .filter((n) => {
      const isRead = n.is_read === 'true' || n.is_read === true;
      if (filter === 'unread') return !isRead;
      if (filter === 'read') return isRead;
      return true;
    })
    .sort((a, b) => {
      const aRead = a.is_read === 'true' || a.is_read === true;
      const bRead = b.is_read === 'true' || b.is_read === true;
      // Sort unread first
      if (aRead !== bRead) {
        return aRead ? 1 : -1;
      }
      // Then sort by date descending
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const handleScroll = () => {
    if (!scrollRef.current || isFetching || !nextKey) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setLastKey(nextKey);
    }
  };

  const handleNotificationClick = async (n) => {
    const isRead = n.is_read === 'true' || n.is_read === true;
    if (!isRead) {
      await markAsRead({ id: n.id }).unwrap().catch(() => {});
    }
    const meetingId = n.meeting_id || n.metadata?.meeting_id;
    if (meetingId) {
      navigate(`/dashboard/meetings/${meetingId}`);
    }
  };

  const handleDelete = async (e, n) => {
    e.stopPropagation();
    await deleteNotification({ id: n.id }).unwrap().catch(() => {});
  };

  const handleMarkRead = async (e, n) => {
    e.stopPropagation();
    await markAsRead({ id: n.id }).unwrap().catch(() => {});
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-brand-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-surface border border-brand-border shadow-sm">
              <Bell size={22} className="text-text-main" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-main">
                Notifications
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  {unreadCount} Unread Alerts
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-border hover:bg-brand-bg hover:text-text-main text-text-muted transition-colors shadow-sm"
            >
              <CheckCheck size={16} />
              <span className="text-xs font-bold tracking-wide">
                Mark all as read
              </span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread', badge: unreadCount },
            { key: 'read', label: 'Read' },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-brand-surface text-text-muted border border-brand-border hover:bg-brand-bg hover:text-text-main'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-brand-border text-text-main'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications Feed */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="space-y-3 pb-20"
        >
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const isRead = n.is_read === 'true' || n.is_read === true;
              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl border transition-all cursor-pointer 
                    ${!isRead 
                      ? 'bg-brand-surface border-blue-500/20 shadow-sm hover:shadow-md' 
                      : 'bg-brand-surface/50 border-brand-border hover:bg-brand-surface opacity-80 hover:opacity-100'
                    }`}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                    !isRead 
                      ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20' 
                      : 'bg-brand-bg border-brand-border grayscale'
                  }`}>
                    {getIcon(n.type)}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!isRead && (
                        <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"></span>
                      )}
                      <h3 className={`text-sm font-semibold truncate ${!isRead ? 'text-text-main' : 'text-text-muted'}`}>
                        {n.title}
                      </h3>
                    </div>
                    <p className={`text-sm leading-relaxed line-clamp-2 ${!isRead ? 'text-text-main/80' : 'text-text-muted/70'}`}>
                      {n.message}
                    </p>
                  </div>

                  {/* Right Column: Time and Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 sm:w-32">
                    <span className="text-xs font-medium text-text-muted whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>

                    {/* Action Buttons: take up space but fade in on hover to prevent overlapping issues */}
                    <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isRead && (
                        <button
                          onClick={(e) => handleMarkRead(e, n)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-bg border border-brand-border text-text-muted hover:text-blue-500 hover:border-blue-500/30 transition-colors tooltip-trigger"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, n)}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-bg border border-brand-border text-text-muted hover:text-red-500 hover:border-red-500/30 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-brand-border bg-brand-surface/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-bg border border-brand-border mb-4">
                <Bell size={28} className="text-text-muted/60" />
              </div>
              <h3 className="text-sm font-semibold text-text-main mb-1">
                {filter === 'unread' ? "You're all caught up!" : filter === 'read' ? "No archived alerts" : "No notifications"}
              </h3>
              <p className="text-xs text-text-muted">
                When you get new updates, they will appear here.
              </p>
            </div>
          )}

          {isFetching && (
            <div className="py-6 flex justify-center">
              <Loader2 size={18} className="animate-spin text-text-muted" />
            </div>
          )}

          {!isFetching && nextKey && (
            <div className="py-4 flex justify-center">
              <button
                onClick={() => setLastKey(nextKey)}
                className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
              >
                Load older notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
