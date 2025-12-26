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
  isAlive: boolean;
  lastPing: number;
}

interface ChatMessage {
  type: "message" | "typing" | "read" | "join" | "leave" | "status" | "subscribe" | "agent_status" | "typing_stop" | "ping" | "pong";
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
let heartbeatInterval: NodeJS.Timeout | null = null;

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const CLIENT_TIMEOUT = 60000; // 60 seconds - consider client dead if no pong

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: "/ws/chat"
  });

  // Start heartbeat interval to detect dead connections
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = setInterval(() => {
    const now = Date.now();
    clients.forEach((client, clientId) => {
      if (!client.isAlive) {
        // Client didn't respond to last ping, terminate connection
        console.log(`[WebSocket] Terminating inactive client: ${clientId}`);
        client.ws.terminate();
        cleanupClient(clientId);
        return;
      }
      
      // Check if client has been silent for too long
      if (now - client.lastPing > CLIENT_TIMEOUT) {
        console.log(`[WebSocket] Client timeout: ${clientId}`);
        client.ws.terminate();
        cleanupClient(clientId);
        return;
      }
      
      // Mark as not alive and send ping
      client.isAlive = false;
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify({ type: "ping", timestamp: now }));
        } catch (error) {
          console.error(`[WebSocket] Error sending ping to ${clientId}:`, error);
        }
      }
    });
  }, HEARTBEAT_INTERVAL);

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const clientId = generateClientId();
    const client: ChatClient = { 
      ws, 
      sessionValidated: false, 
      isAlive: true, 
      lastPing: Date.now() 
    };
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
        
        // Update client's last activity time
        const clientObj = clients.get(clientId);
        if (clientObj) {
          clientObj.lastPing = Date.now();
          clientObj.isAlive = true;
        }
        
        handleMessage(clientId, message);
      } catch (error) {
        console.error("[WebSocket] Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
      cleanupClient(clientId);
    });

    ws.on("error", (error) => {
      console.error(`[WebSocket] Client error: ${clientId}`, error);
      // Clean up the client on error to prevent resource leaks
      cleanupClient(clientId);
    });

    // Handle native WebSocket pong frames
    ws.on("pong", () => {
      const clientObj = clients.get(clientId);
      if (clientObj) {
        clientObj.isAlive = true;
        clientObj.lastPing = Date.now();
      }
    });

    ws.send(JSON.stringify({ type: "connected", clientId }));
  });

  console.log("[WebSocket] Server initialized on /ws/chat");
  return wss;
}

function cleanupClient(clientId: string) {
  const client = clients.get(clientId);
  if (client?.activeConversationId) {
    unsubscribeFromConversation(clientId, client.activeConversationId);
  }
  conversationSubscribers.forEach((subscribers) => {
    subscribers.delete(clientId);
  });
  clients.delete(clientId);
}

function handleMessage(clientId: string, message: ChatMessage & { clientType?: string; adminToken?: string }) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case "pong":
      // Client responded to our ping
      client.isAlive = true;
      client.lastPing = Date.now();
      break;

    case "ping":
      // Client sent ping, respond with pong
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      }
      break;

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
        
        // Send confirmation back to client
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({ 
            type: "subscribed", 
            conversationId: message.conversationId 
          }));
        }
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
        try {
          client.ws.send(payload);
        } catch (error) {
          console.error(`[WebSocket] Error sending to ${subscriberId}:`, error);
        }
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
      try {
        client.ws.send(payload);
      } catch (error) {
        console.error(`[WebSocket] Error sending to admin ${subscriberId}:`, error);
      }
    }
  });
}

function broadcastAgentStatusToAll(message: ChatMessage) {
  const payload = JSON.stringify(message);
  clients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(payload);
      } catch (error) {
        console.error(`[WebSocket] Error broadcasting to ${clientId}:`, error);
      }
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
  
  clients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(payload);
      } catch (error) {
        console.error(`[WebSocket] Error sending status to ${clientId}:`, error);
      }
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
        try {
          client.ws.send(payload);
        } catch (error) {
          console.error(`[WebSocket] Error sending message to ${subscriberId}:`, error);
        }
      }
    });
  }
  
  clients.forEach((client, clientId) => {
    if (client.isAdmin && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify({
          type: "new_message_notification",
          conversationId,
          preview: message.content?.substring(0, 100),
        }));
      } catch (error) {
        console.error(`[WebSocket] Error sending notification to ${clientId}:`, error);
      }
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
        try {
          client.ws.send(payload);
        } catch (error) {
          console.error(`[WebSocket] Error sending update to ${subscriberId}:`, error);
        }
      }
    });
  }
}

export function broadcastLiveAgentRequest(conversationId: string, visitorInfo: any) {
  const payload = JSON.stringify({
    type: "live_agent_request",
    conversationId,
    visitorName: visitorInfo.visitorName,
    visitorPhone: visitorInfo.visitorPhone,
    eventType: visitorInfo.eventType,
    timestamp: new Date().toISOString(),
  });
  
  clients.forEach((client, clientId) => {
    if (client.isAdmin && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(payload);
      } catch (error) {
        console.error(`[WebSocket] Error sending live agent request to ${clientId}:`, error);
      }
    }
  });
}

export function broadcastVideoUploadProgress(userId: string, progress: number, fileName?: string) {
  const payload = JSON.stringify({
    type: "video_upload_progress",
    userId,
    progress,
    fileName,
    timestamp: new Date().toISOString(),
  });
  
  clients.forEach((client, clientId) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(payload);
      } catch (error) {
        console.error(`[WebSocket] Error sending upload progress to ${clientId}:`, error);
      }
    }
  });
}

function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Cleanup on server shutdown
export function cleanupWebSocket() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (wss) {
    wss.close();
    wss = null;
  }
  clients.clear();
  conversationSubscribers.clear();
}

export { wss };
