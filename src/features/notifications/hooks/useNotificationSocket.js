import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import websocketService from '../../../services/websocketService';
import { notificationsApi } from '../api/notificationsApi';
import toast from 'react-hot-toast';

export function useNotificationSocket() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!accessToken || !user) return;

    // Based on requirements, the path is tied to user_id or similar
    const path = `/ws/v1/notifications/`;
    
    websocketService.connect(
      path,
      accessToken,
      (message) => {
        if (message.type === 'notification' || message.type === 'notification.push') {
          // Update the cache by adding the new notification to the list
          dispatch(
            notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
              if (draft?.data?.results && message.notification) {
                const exists = draft.data.results.some(n => n.id === message.notification.id);
                if (!exists) {
                  draft.data.results.unshift(message.notification);
                  draft.data.unread_count = (draft.data.unread_count || 0) + 1;
                }
              }
            })
          );

          // Invalidate tags to force background sync with database
          dispatch(
            notificationsApi.util.invalidateTags(['Notification'])
          );

          // Display a styled real-time toast alert
          const notif = message.notification;
          if (notif) {
            const title = notif.title || 'New Notification';
            const text = notif.message || '';
            const type = notif.type;

            let toastIcon = '🔔';
            if (type === 'transcription_done') toastIcon = '📝';
            else if (type === 'summary_done') toastIcon = '✨';
            else if (type === 'bot_failed') toastIcon = '⚠️';

            toast(`${title}\n${text}`, {
              icon: toastIcon,
              duration: 6000,
              style: {
                background: 'var(--brand-surface)',
                border: '1px solid var(--brand-border)',
                color: 'var(--text-main)',
                borderRadius: '16px',
                fontSize: '11px',
                padding: '12px 16px',
                fontWeight: '500',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                whiteSpace: 'pre-line',
              }
            });
          }
        }
      }
    );

    return () => {
      websocketService.disconnect(path);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.id, dispatch]);
}
