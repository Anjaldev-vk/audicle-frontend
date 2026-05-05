import React, { useState } from 'react';
import { Bell, Check, Trash2, X, AlertCircle, Info, Sparkles, FileText } from 'lucide-react';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation, 
  useDeleteNotificationMutation 
} from '../api/notificationsApi';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notificationsRes, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsRes?.data?.results || [];
  const unreadCount = notificationsRes?.data?.unread_count || 0;

  const getIcon = (type) => {
    switch (type) {
      case 'transcription_done': return <FileText size={14} className="text-blue-400" />;
      case 'summary_done': return <Sparkles size={14} className="text-emerald-400" />;
      case 'bot_failed': return <AlertCircle size={14} className="text-red-400" />;
      default: return <Info size={14} className="text-indigo-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-brand-surface border border-brand-border rounded-xl text-gray-500 hover:text-white transition-all group"
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
          <div className="absolute right-0 mt-4 w-96 bg-brand-surface border border-brand-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Intelligence Alerts</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{unreadCount} UNREAD NOTIFICATIONS</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-5 hover:bg-white/[0.02] transition-all group relative ${!n.is_read ? 'bg-blue-600/[0.03]' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${!n.is_read ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/5'}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-white truncate">{n.title}</span>
                            <span className="text-[9px] font-bold text-gray-600 uppercase whitespace-nowrap">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                      
                      <div className="absolute right-4 bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.is_read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="p-1.5 bg-brand-bg border border-white/5 rounded-md text-gray-500 hover:text-blue-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="p-1.5 bg-brand-bg border border-white/5 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Everything is up to date</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 text-center">
              <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                View notification history
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
