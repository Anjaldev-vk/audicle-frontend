import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import websocketService from '../../../services/websocketService';
import { notificationsApi } from '../api/notificationsApi';

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
        if (message.type === 'notification.push') {
          // Update the cache by adding the new notification to the list
          dispatch(
            notificationsApi.util.updateQueryData('getNotifications', undefined, (draft) => {
              if (draft?.data?.results) {
                draft.data.results.unshift(message.notification);
                draft.data.unread_count = (draft.data.unread_count || 0) + 1;
              }
            })
          );
        }
      }
    );

    return () => {
      websocketService.disconnect(path);
    };
  }, [accessToken, user, dispatch]);
}
