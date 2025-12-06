import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";

interface ChatClient {
  ws: WebSocket;
  visitorId?: string;
  isAdmin?: boolean;
  userId?: string;
  activeConversationId?: string;
}

interface ChatMessage {
  type: "message" | "typing" | "read" | "join" | "leave" | "status" | "subscribe";
  conversationId?: string;
  messageId?: string;
  content?: string;
  senderId?: string;
  senderType?: string;
  senderName?: string;
  visitorId?: string;
  timestamp?: string;
}

const clients: Map<string, ChatClient> = new Map();
const conversationSubscribers: Map<string, Set<string>> = new Map();
let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: "/ws/chat"
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const clientId = generateClientId();
    const client: ChatClient = { ws };
    clients.set(clientId, client);

    console.log(`[WebSocket] Client connected: ${clientId}`);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString()) as ChatMessage & { clientType?: string };
        handleMessage(clientId, message);
      } catch (error) {
        console.error("[WebSocket] Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
      const client = clients.get(clientId);
      if (client?.activeConversationId) {
        unsubscribeFromConversation(clientId, client.activeConversationId);
      }
      conversationSubscribers.forEach((subscribers) => {
        subscribers.delete(clientId);
      });
      clients.delete(clientId);
    });

    ws.on("error", (error) => {
      console.error(`[WebSocket] Client error: ${clientId}`, error);
    });

    ws.send(JSON.stringify({ type: "connected", clientId }));
  });

  console.log("[WebSocket] Server initialized on /ws/chat");
  return wss;
}

function handleMessage(clientId: string, message: ChatMessage & { clientType?: string }) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case "join":
      if (message.clientType === "admin") {
        client.isAdmin = true;
        client.userId = message.senderId;
      } else {
        client.visitorId = message.visitorId;
      }
      console.log(`[WebSocket] Client ${clientId} joined as ${message.clientType || "visitor"}`);
      break;

    case "subscribe":
      if (message.conversationId) {
        if (client.activeConversationId) {
          unsubscribeFromConversation(clientId, client.activeConversationId);
        }
        subscribeToConversation(clientId, message.conversationId);
        client.activeConversationId = message.conversationId;
        console.log(`[WebSocket] Client ${clientId} subscribed to conversation ${message.conversationId}`);
      }
      break;

    case "message":
      if (message.conversationId) {
        broadcastToConversation(message.conversationId, {
          type: "message",
          conversationId: message.conversationId,
          content: message.content,
          senderId: message.senderId,
          senderType: message.senderType,
          senderName: message.senderName,
          timestamp: new Date().toISOString(),
        }, clientId);
      }
      break;

    case "typing":
      if (message.conversationId) {
        broadcastToConversation(message.conversationId, {
          type: "typing",
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderType: message.senderType,
        }, clientId);
      }
      break;

    case "read":
      if (message.conversationId) {
        broadcastToConversation(message.conversationId, {
          type: "read",
          conversationId: message.conversationId,
          messageId: message.messageId,
          senderId: message.senderId,
        }, clientId);
      }
      break;
  }
}

function subscribeToConversation(clientId: string, conversationId: string) {
  if (!conversationSubscribers.has(conversationId)) {
    conversationSubscribers.set(conversationId, new Set());
  }
  conversationSubscribers.get(conversationId)!.add(clientId);
}

function unsubscribeFromConversation(clientId: string, conversationId: string) {
  const subscribers = conversationSubscribers.get(conversationId);
  if (subscribers) {
    subscribers.delete(clientId);
    if (subscribers.size === 0) {
      conversationSubscribers.delete(conversationId);
    }
  }
}

function broadcastToConversation(conversationId: string, message: ChatMessage, excludeClientId?: string) {
  const subscribers = conversationSubscribers.get(conversationId);
  if (!subscribers) return;

  const payload = JSON.stringify(message);
  subscribers.forEach((subscriberId) => {
    if (subscriberId !== excludeClientId) {
      const client = clients.get(subscriberId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  });
}

function notifyAdminsForConversation(conversationId: string, message: ChatMessage) {
  const subscribers = conversationSubscribers.get(conversationId);
  if (!subscribers) return;

  const payload = JSON.stringify(message);
  subscribers.forEach((subscriberId) => {
    const client = clients.get(subscriberId);
    if (client && client.isAdmin && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

export function broadcastNewMessage(conversationId: string, message: any) {
  const payload = JSON.stringify({
    type: "message",
    conversationId,
    ...message,
    timestamp: new Date().toISOString(),
  });
  
  const subscribers = conversationSubscribers.get(conversationId);
  if (subscribers) {
    subscribers.forEach((subscriberId) => {
      const client = clients.get(subscriberId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }
  
  clients.forEach((client) => {
    if (client.isAdmin && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: "new_message_notification",
        conversationId,
        preview: message.content?.substring(0, 100),
      }));
    }
  });
}

export function broadcastConversationUpdate(conversationId: string, update: any) {
  const payload = JSON.stringify({
    type: "status",
    conversationId,
    ...update,
  });
  
  const subscribers = conversationSubscribers.get(conversationId);
  if (subscribers) {
    subscribers.forEach((subscriberId) => {
      const client = clients.get(subscriberId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }
}

function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export { wss };
