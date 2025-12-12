import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  type: "message" | "typing" | "read" | "connected" | "status" | "subscribe" | "subscribed" | "new_message_notification" | "live_agent_request" | "ping" | "pong" | "error";
  conversationId?: string;
  messageId?: string;
  content?: string;
  senderId?: string;
  senderType?: string;
  senderName?: string;
  messageType?: string;
  isRead?: boolean;
  createdAt?: string;
  timestamp?: string;
  clientId?: string;
  preview?: string;
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  message?: string;
}

interface UseChatWebSocketOptions {
  isAdmin?: boolean;
  userId?: string;
  visitorId?: string;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (data: { conversationId: string; senderId: string; senderType: string }) => void;
  onError?: (error: string) => void;
}

const PING_INTERVAL = 25000; // 25 seconds - slightly less than server's 30s
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Progressive backoff

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
  const { isAdmin = false, userId, visitorId, onMessage, onTyping, onError } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const activeConversationRef = useRef<string | null>(null);
  const isConnectingRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const queryClient = useQueryClient();

  const onMessageRef = useRef(onMessage);
  const onTypingRef = useRef(onTyping);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onTypingRef.current = onTyping;
  }, [onTyping]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const startPingInterval = useCallback((ws: WebSocket) => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
        } catch (error) {
          console.error("[WebSocket] Error sending ping:", error);
        }
      }
    }, PING_INTERVAL);
  }, []);

  const connect = useCallback(() => {
    if (isConnectingRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    isConnectingRef.current = true;
    clearTimers();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        isConnectingRef.current = false;
        setIsConnected(true);
        reconnectAttemptRef.current = 0;
        console.log("[WebSocket] Connected");

        // Start ping interval
        startPingInterval(ws);

        // Send join message
        ws.send(JSON.stringify({
          type: "join",
          clientType: isAdmin ? "admin" : "visitor",
          senderId: isAdmin ? userId : visitorId,
          visitorId,
        }));

        // Re-subscribe to active conversation if we had one
        if (activeConversationRef.current) {
          ws.send(JSON.stringify({
            type: "subscribe",
            conversationId: activeConversationRef.current,
          }));
          console.log("[WebSocket] Re-subscribing to conversation:", activeConversationRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ChatMessage;

          switch (data.type) {
            case "ping":
              // Server sent ping, respond with pong
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
              }
              break;

            case "pong":
              // Server responded to our ping, connection is alive
              break;

            case "message":
              queryClient.invalidateQueries({ queryKey: ["chatMessages", data.conversationId] });
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
              onMessageRef.current?.(data);
              break;

            case "typing":
              if (data.conversationId && data.senderId) {
                setTypingUsers((prev) => {
                  const next = new Map(prev);
                  next.set(data.conversationId!, data.senderType || "visitor");
                  return next;
                });
                setTimeout(() => {
                  setTypingUsers((prev) => {
                    const next = new Map(prev);
                    next.delete(data.conversationId!);
                    return next;
                  });
                }, 3000);
                onTypingRef.current?.({
                  conversationId: data.conversationId,
                  senderId: data.senderId,
                  senderType: data.senderType || "visitor",
                });
              }
              break;

            case "read":
              queryClient.invalidateQueries({ queryKey: ["chatMessages", data.conversationId] });
              break;

            case "status":
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
              break;

            case "subscribed":
              console.log("[WebSocket] Subscribed to conversation:", data.conversationId);
              break;

            case "new_message_notification":
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
              break;

            case "live_agent_request":
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
              onMessageRef.current?.(data);
              break;

            case "error":
              console.error("[WebSocket] Server error:", data.message);
              onErrorRef.current?.(data.message || "Unknown error");
              break;

            case "connected":
              console.log("[WebSocket] Client ID:", data.clientId);
              break;
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        setIsConnected(false);
        clearTimers();

        // Don't reconnect if it was a clean close
        if (event.code === 1000) {
          console.log("[WebSocket] Closed normally");
          return;
        }

        const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
        reconnectAttemptRef.current++;
        console.log(`[WebSocket] Disconnected (code: ${event.code}), reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        isConnectingRef.current = false;
        console.error("[WebSocket] Error:", error);
      };
    } catch (error) {
      isConnectingRef.current = false;
      console.error("[WebSocket] Connection failed:", error);
      
      const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
      reconnectAttemptRef.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    }
  }, [isAdmin, userId, visitorId, queryClient, clearTimers, startPingInterval]);

  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
    activeConversationRef.current = null;
  }, [clearTimers]);

  const sendMessage = useCallback((message: Partial<ChatMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error("[WebSocket] Error sending message:", error);
      }
    }
  }, []);

  const sendTyping = useCallback((conversationId: string) => {
    sendMessage({
      type: "typing",
      conversationId,
      senderId: isAdmin ? userId : visitorId,
      senderType: isAdmin ? "admin" : "visitor",
    });
  }, [isAdmin, userId, visitorId, sendMessage]);

  const sendRead = useCallback((conversationId: string, messageId: string) => {
    sendMessage({
      type: "read",
      conversationId,
      messageId,
      senderId: isAdmin ? userId : visitorId,
    });
  }, [isAdmin, userId, visitorId, sendMessage]);

  const subscribeToConversation = useCallback((conversationId: string) => {
    activeConversationRef.current = conversationId;
    sendMessage({
      type: "subscribe",
      conversationId,
    });
  }, [sendMessage]);

  // Initial connection
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  // Reconnect when user identity changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "join",
        clientType: isAdmin ? "admin" : "visitor",
        senderId: isAdmin ? userId : visitorId,
        visitorId,
      }));
    }
  }, [isAdmin, userId, visitorId]);

  // Handle visibility change - reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        console.log("[WebSocket] Tab visible, checking connection...");
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          reconnectAttemptRef.current = 0;
          connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isConnected, connect]);

  return {
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping,
    sendRead,
    subscribeToConversation,
    reconnect: connect,
  };
}
