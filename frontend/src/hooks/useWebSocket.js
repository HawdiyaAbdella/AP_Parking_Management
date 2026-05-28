import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useWebSocket = (onSlotUpdate) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const callbackRef = useRef(onSlotUpdate);

  useEffect(() => {
    callbackRef.current = onSlotUpdate;
  }, [onSlotUpdate]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);

        client.subscribe('/topic/slots', (message) => {
          if (!message.body) {
            return;
          }

          try {
            const parsed = JSON.parse(message.body);
            if (Array.isArray(parsed)) {
              parsed.forEach((slot) => callbackRef.current?.(slot));
            } else {
              callbackRef.current?.(parsed);
            }
          } catch (error) {
            // Ignore malformed websocket payloads.
          }
        });

        client.subscribe('/topic/slots.init', (message) => {
          if (!message.body) {
            return;
          }

          try {
            const parsed = JSON.parse(message.body);
            if (Array.isArray(parsed)) {
              parsed.forEach((slot) => callbackRef.current?.(slot));
            } else {
              callbackRef.current?.(parsed);
            }
          } catch (error) {
            // Ignore malformed websocket payloads.
          }
        });

        client.publish({
          destination: '/app/slots.getAll',
          body: '',
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
      onStompError: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      setConnected(false);
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return connected;
};

export default useWebSocket;
