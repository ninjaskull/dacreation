import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import { getUserFromSessionId, parseSessionIdFromCookies } from "./auth";

interface ChatClient {
  ws: WebSocket;
  visitorId?: string;
  isAdmin?: boolean;
  userId?: string;
  userName?: string;
  sessionValidated?: boolean;
  activeConversationId?: string;
}

interface ChatMessage {
  type: "message" | "typing" | "read" | "join" | "leave" | "status" | "subscribe" | "agent_status" | "typing_stop";
  conversationId?: string;
  messageId?: string;
  content?: string;
  senderId?: string;
  senderType?: string;
  senderName?: string;
  visitorId?: string;
  timestamp?: string;
  agentStatus?: "online" | "away" | "offline";
  statusMessage?: string;
}

const clients: Map<string, ChatClient> = new Map();
const conversationSubscribers: Map<string, Set<string>> = new Map();
let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: "/ws/chat"
  });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const clientId = generateClientId();
    const client: ChatClient = { ws, sessionValidated: false };
    clients.set(clientId, client);

    // Attempt to validate session from cookies during connection
    const sessionId = parseSessionIdFromCookies(req.headers.cookie);
    if (sessionId) {
      const user = await getUserFromSessionId(sessionId);
      if (user && (user.role === 'admin' || user.role === 'staff')) {
        client.isAdmin = true;
        client.userId = user.id;
        client.userName = user.name || user.username;
        client.sessionValidated = true;
        console.log(`[WebSocket] Admin session validated for: ${user.username} (${clientId})`);
      }
    }

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

function handleMessage(clientId: string, message: ChatMessage & { clientType?: string; adminToken?: string }) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case "join":
      if (message.clientType === "admin") {
        // Admin status is determined by session validation during connection
        // Do not trust client-provided senderId for admin privileges
        if (client.sessionValidated && client.isAdmin) {
          console.log(`[WebSocket] Admin client ${clientId} joined (session validated, userId: ${client.userId})`);
        } else {
          console.warn(`[WebSocket] Client ${clientId} attempted admin join without valid session - denied`);
          client.isAdmin = false;
          client.userId = undefined;
          client.ws.send(JSON.stringify({ 
            type: "error", 
            message: "Admin authentication required. Please log in and try again." 
          }));
        }
      } else {
        client.visitorId = message.visitorId;
        client.isAdmin = false;
        console.log(`[WebSocket] Visitor client ${clientId} joined`);
      }
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

    case "typing_stop":
      if (message.conversationId) {
        broadcastToConversation(message.conversationId, {
          type: "typing_stop",
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderType: message.senderType,
        }, clientId);
      }
      break;

    case "agent_status":
      // Only allow session-validated admin users to broadcast status
      if (client.sessionValidated && client.isAdmin && client.userId && message.agentStatus) {
        broadcastAgentStatusToAll({
          type: "agent_status",
          senderId: client.userId, // Use session-verified userId
          senderName: client.userName || message.senderName, // Prefer session-verified name
          agentStatus: message.agentStatus,
          statusMessage: message.statusMessage,
          timestamp: new Date().toISOString(),
        });
      } else if (!client.sessionValidated) {
        console.warn(`[WebSocket] Client ${clientId} attempted agent_status without valid session`);
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

function broadcastAgentStatusToAll(message: ChatMessage) {
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

export function broadcastAgentStatusChange(userId: string, userName: string, status: string, statusMessage?: string) {
  const payload = JSON.stringify({
    type: "agent_status",
    senderId: userId,
    senderName: userName,
    agentStatus: status,
    statusMessage: statusMessage,
    timestamp: new Date().toISOString(),
  });
  
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
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
