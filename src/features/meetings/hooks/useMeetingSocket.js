import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import websocketService from '../../../services/websocketService';
import { baseApi } from '../../../services/baseApi';

export function useMeetingSocket(meetingId) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!meetingId || !accessToken) return;

    const path = `/ws/v1/meetings/${meetingId}/`;
    
    websocketService.connect(
      path,
      accessToken,
      (message) => {
        // Handle meeting status updates
        if (message.type === 'meeting.status') {
          dispatch(
            baseApi.util.updateQueryData('getMeeting', meetingId, (draft) => {
              if (draft) draft.status = message.status;
            })
          );
          // Also invalidate meetings list to reflect changes
          dispatch(baseApi.util.invalidateTags(['Meeting']));
        }
        
        // Handle transcript/summary ready events
        if (message.type === 'transcript.ready') {
          dispatch(baseApi.util.invalidateTags(['Transcript', 'Segment']));
        }
        
        if (message.type === 'summary.ready') {
          dispatch(baseApi.util.invalidateTags(['Summary']));
        }
      }
    );

    return () => {
      websocketService.disconnect(path);
    };
  }, [meetingId, accessToken, dispatch]);
}
