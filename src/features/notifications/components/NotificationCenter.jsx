import React, { useState, useRef } from 'react';
import { Bell, Check, Trash2, X, AlertCircle, Info, Sparkles, FileText, ChevronDown, Loader2 } from 'lucide-react';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation, 
  useDeleteNotificationMutation 
} from '../api/notificationsApi';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastKey, setLastKey] = useState(null);
  const navigate = useNavigate();
  
  // Start WebSocket connection
  useNotificationSocket();

  const { data: notificationsRes, isFetching } = useGetNotificationsQuery({ limit: 20, lastKey });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsRes?.data?.results || [];
  const unreadCount = notificationsRes?.data?.unread_count || 0;
  const nextKey = notificationsRes?.data?.last_key;

  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current || isFetching || !nextKey) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setLastKey(nextKey);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'transcription_done': return <FileText size={14} className="text-blue-400" />;
      case 'summary_done': return <Sparkles size={14} className="text-emerald-400" />;
      case 'bot_failed': return <AlertCircle size={14} className="text-red-400" />;
      default: return <Info size={14} className="text-indigo-400" />;
    }
  };

  const handleNotificationClick = async (n) => {
    if (n.is_read !== 'true' && n.is_read !== true) {
      await markAsRead({ id: n.id, sk: n.sk }).unwrap();
    }
    const meetingId = n.meeting_id || n.metadata?.meeting_id;
    if (meetingId) {
      navigate(`/dashboard/meetings/${meetingId}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-brand-surface border border-brand-border rounded-xl text-text-muted hover:text-text-main transition-all group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-brand-bg -mr-1 -mt-1 shadow-lg shadow-blue-600/20">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-[400px] bg-brand-surface border border-brand-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-highlight/30">
              <div>
                <h3 className="text-sm font-bold text-text-main tracking-tight">Intelligence Alerts</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{unreadCount} UNREAD NOTIFICATIONS</p>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-main">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-[450px] overflow-y-auto custom-scrollbar"
            >
              {notifications.length > 0 ? (
                <div className="divide-y divide-brand-border">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-5 hover:bg-brand-bg/50 transition-all group relative cursor-pointer ${n.is_read !== 'true' && n.is_read !== true ? 'bg-blue-600/[0.03]' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${n.is_read !== 'true' && n.is_read !== true ? 'bg-blue-600/10 border-blue-500/20' : 'bg-brand-bg/50 border-brand-border'}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-xs font-bold truncate ${n.is_read !== 'true' && n.is_read !== true ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</span>
                            <span className="text-[9px] font-bold text-text-muted uppercase whitespace-nowrap">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${n.is_read !== 'true' && n.is_read !== true ? 'text-text-main/80' : 'text-text-muted/70'}`}>{n.message}</p>
                        </div>
                      </div>
                      
                      <div className="absolute right-4 bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification({ id: n.id, sk: n.sk });
                          }}
                          className="p-1.5 bg-brand-bg border border-brand-border rounded-md text-text-muted hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {isFetching && (
                    <div className="p-4 text-center">
                      <Loader2 size={16} className="animate-spin text-blue-500 mx-auto" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-bg/50 border border-brand-border flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-brand-bg/50 border-t border-brand-border text-center">
              <button 
                onClick={() => navigate('/dashboard/notifications')}
                className="text-[10px] font-bold text-text-muted hover:text-text-main uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                View all history <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;

