// hooks/useMeetingSocket.js
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export function useMeetingSocket(meetingId, onEvent) {
  const accessToken = useSelector((s) => s.auth.accessToken);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!meetingId || !accessToken) return;
    const url = `ws://${window.location.host}/ws/v1/meetings/${meetingId}/?token=${accessToken}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (e) => onEvent(JSON.parse(e.data));
    ws.onerror = (e) => console.error("WS error", e);
    return () => ws.close();
  }, [meetingId, accessToken]);
}
