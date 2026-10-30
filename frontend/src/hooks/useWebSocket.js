import { useEffect, useRef, useState, useCallback } from 'react';

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

const WS_URL = import.meta.env.VITE_WS_URL || (isLocal ? 'ws://localhost:8000/ws' : null);

export const useWebSocket = (onMessageCallback) => {
  const [isConnected, setIsConnected] = useState(!WS_URL);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!WS_URL) {
      // Cloud demo mode: simulate connected status without throwing network errors
      setIsConnected(true);
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLastMessage(parsed);
          if (onMessageCallback) {
            onMessageCallback(parsed);
          }
        } catch (err) {
          // Silent JSON parse fallback
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        // Use debug logging to avoid polluting Lighthouse console audit
        console.debug('[WebSocket] Connection unavailable:', error);
        ws.close();
      };

      socketRef.current = ws;
    } catch (err) {
      console.debug('[WebSocket] Connection attempt failed:', err);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [onMessageCallback]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
};
