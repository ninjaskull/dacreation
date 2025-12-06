import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  type: "message" | "typing" | "read" | "connected" | "status" | "subscribe" | "new_message_notification";
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
}

interface UseChatWebSocketOptions {
  isAdmin?: boolean;
  userId?: string;
  visitorId?: string;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (data: { conversationId: string; senderId: string; senderType: string }) => void;
}

export function useChatWebSocket(options: UseChatWebSocketOptions = {}) {
  const { isAdmin = false, userId, visitorId, onMessage, onTyping } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[WebSocket] Connected");

        ws.send(JSON.stringify({
          type: "join",
          clientType: isAdmin ? "admin" : "visitor",
          senderId: isAdmin ? userId : visitorId,
          visitorId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ChatMessage;

          switch (data.type) {
            case "message":
              queryClient.invalidateQueries({ queryKey: ["chatMessages", data.conversationId] });
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
              onMessage?.(data);
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
                onTyping?.({
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

            case "new_message_notification":
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
              break;

            case "connected":
              console.log("[WebSocket] Client ID:", data.clientId);
              break;
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("[WebSocket] Disconnected, reconnecting in 3s...");
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [isAdmin, userId, visitorId, onMessage, onTyping, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: Partial<ChatMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
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
    sendMessage({
      type: "subscribe",
      conversationId,
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

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
