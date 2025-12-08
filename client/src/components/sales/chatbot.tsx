import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Headphones, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";

interface Message {
  id: string;
  type: "bot" | "user" | "system" | "agent";
  text: string;
  showContactForm?: boolean;
  timestamp?: Date;
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem('da_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('da_visitor_id', visitorId);
  }
  return visitorId;
}

function getStoredConversation(): string | null {
  return localStorage.getItem('da_conversation_id');
}

function setStoredConversation(id: string | null) {
  if (id) {
    localStorage.setItem('da_conversation_id', id);
  } else {
    localStorage.removeItem('da_conversation_id');
  }
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(getStoredConversation());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnectedState] = useState(false);
  const [visitorName, setVisitorName] = useState(localStorage.getItem('da_visitor_name') || "");
  const [visitorPhone, setVisitorPhone] = useState(localStorage.getItem('da_visitor_phone') || "");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [hasSubmittedContact, setHasSubmittedContact] = useState(localStorage.getItem('da_contact_submitted') === 'true');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const visitorId = getVisitorId();

  const handleNewMessage = useCallback((data: any) => {
    if (data.senderType === 'admin' && data.conversationId === conversationId) {
      setMessages((prev) => [
        ...prev,
        {
          id: data.messageId || Date.now().toString(),
          type: "agent",
          text: data.content || '',
          timestamp: new Date(data.createdAt || Date.now()),
        },
      ]);
    }
  }, [conversationId]);

  const handleTyping = useCallback((data: any) => {
    if (data.senderType === 'admin' && data.conversationId === conversationId) {
      setIsAgentTyping(true);
      setTimeout(() => setIsAgentTyping(false), 3000);
    }
  }, [conversationId]);

  const { isConnected: wsConnected, sendTyping, subscribeToConversation } = useChatWebSocket({
    isAdmin: false,
    visitorId,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
  });

  useEffect(() => {
    if (conversationId && isConnected) {
      subscribeToConversation(conversationId);
    }
  }, [conversationId, isConnected, subscribeToConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping]);

  const loadExistingMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`);
      if (response.ok) {
        const existingMessages = await response.json();
        if (existingMessages.length > 0) {
          const formattedMessages: Message[] = existingMessages.map((msg: any) => ({
            id: msg.id,
            type: msg.senderType === 'admin' ? 'agent' : msg.senderType === 'system' ? 'system' : 'user',
            text: msg.content,
            timestamp: new Date(msg.createdAt),
          }));
          setMessages(formattedMessages);
          return true;
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
    return false;
  };

  const connectToLiveAgent = async (existingConvId?: string) => {
    setIsConnecting(true);
    try {
      let convId = existingConvId;
      
      if (existingConvId) {
        const hasMessages = await loadExistingMessages(existingConvId);
        if (hasMessages) {
          setIsConnectedState(true);
          subscribeToConversation(existingConvId);
          setIsConnecting(false);
          return;
        }
      }
      
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          visitorName: visitorName || null,
          visitorPhone: visitorPhone || null,
          lastMessageAt: new Date().toISOString(),
          wantsLiveAgent: true,
          status: "live_agent",
        }),
      });
      
      if (response.ok) {
        const conversation = await response.json();
        convId = conversation.id;
        setConversationId(convId!);
        setStoredConversation(convId!);
        
        await fetch(`/api/conversations/${convId}/request-live-agent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        setIsConnectedState(true);
        subscribeToConversation(convId!);
        
        setMessages([{
          id: Date.now().toString(),
          type: "system",
          text: "You're now connected to our support team. An agent will respond shortly!",
          timestamp: new Date(),
        }]);
        
        if (!hasSubmittedContact) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                type: "system",
                text: "While you wait, please share your contact details so we can better assist you:",
                showContactForm: true,
                timestamp: new Date(),
              },
            ]);
            setShowContactForm(true);
          }, 2000);
        }
        
        toast({
          title: "Connected!",
          description: "An agent will be with you shortly.",
        });
      } else {
        throw new Error("Failed to connect");
      }
    } catch (error) {
      console.error("Failed to connect to agent:", error);
      setMessages([{
        id: Date.now().toString(),
        type: "system",
        text: "Sorry, we couldn't connect you right now. Please try again or call us directly.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      connectToLiveAgent(conversationId || undefined);
    }
  }, [isOpen]);

  const sendMessageToServer = async (content: string) => {
    if (!conversationId) return;
    
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: visitorId,
          senderType: 'visitor',
          senderName: visitorName || 'Visitor',
          content,
          messageType: 'text',
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    
    const phoneRegex = /^[\d\s+\-()]{10,}$/;
    if (!phoneRegex.test(contactPhone.replace(/\s/g, ''))) {
      toast({
        title: "Invalid phone",
        description: "Please enter a valid phone number (10+ digits)",
        variant: "destructive",
      });
      return;
    }
    
    setVisitorName(contactName.trim());
    setVisitorPhone(contactPhone.trim());
    localStorage.setItem('da_visitor_name', contactName.trim());
    localStorage.setItem('da_visitor_phone', contactPhone.trim());
    localStorage.setItem('da_contact_submitted', 'true');
    setHasSubmittedContact(true);
    setShowContactForm(false);
    
    if (conversationId) {
      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          visitorName: contactName.trim(),
          visitorPhone: contactPhone.trim(),
        }),
      });
    }
    
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim(),
          phone: contactPhone.trim(),
          email: `${contactPhone.replace(/\D/g, '')}@livechat.lead`,
          leadSource: "live_chat",
          contactMethod: "call",
          message: "Lead captured from live chat",
        }),
      });
    } catch (error) {
      console.error("Failed to create lead:", error);
    }
    
    setMessages((prev) => prev.filter(m => !m.showContactForm).concat({
      id: Date.now().toString(),
      type: "system",
      text: `Thanks ${contactName.trim()}! Our agent now has your contact details.`,
      timestamp: new Date(),
    }));
    
    setContactName("");
    setContactPhone("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        text: messageText,
        timestamp: new Date(),
      },
    ]);
    
    setInputValue("");
    
    if (conversationId) {
      sendTyping(conversationId);
      sendMessageToServer(messageText);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setStoredConversation(null);
    setIsOpen(false);
    setIsConnectedState(false);
    setIsConnecting(false);
    setShowContactForm(false);
  };

  return (
    <div className="floating-widget">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 md:bottom-6 md:left-6 md:right-auto z-50 w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="chatbot-button"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <img src="/images/icon-white.webp" alt="DA" className="w-8 h-8 object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-40 right-4 md:bottom-24 md:left-6 md:right-auto z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl shadow-2xl border overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
            data-testid="chatbot-window"
          >
            <div className="p-4 text-white flex items-center justify-between bg-emerald-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Live Chat Support</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : isConnecting ? 'bg-yellow-300 animate-pulse' : 'bg-red-300'}`} />
                    <p className="text-xs text-white/80">
                      {isConnecting ? "Connecting..." : isConnected ? (wsConnected ? "Connected" : "Reconnecting...") : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetChat}
                className="text-white hover:bg-white/20"
                data-testid="btn-end-chat"
              >
                End Chat
              </Button>
            </div>

            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
              <p className="text-xs text-emerald-700 text-center">
                {isConnecting 
                  ? "Connecting you to our team..." 
                  : "Chat with our team - we typically respond within minutes"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
              {isConnecting && messages.length === 0 && (
                <div className="flex justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Connecting to support...</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : 
                    message.type === "system" ? "justify-center" : 
                    "justify-start"
                  }`}
                >
                  {message.type === "system" ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 max-w-[90%]">
                      <p className="text-xs text-blue-700 text-center">{message.text}</p>
                      {message.showContactForm && showContactForm && (
                        <form onSubmit={handleContactSubmit} className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
                            <User className="w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="Your name"
                              className="flex-1 text-sm border-0 outline-none bg-transparent text-gray-700"
                              data-testid="input-contact-name"
                            />
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="Phone number"
                              className="flex-1 text-sm border-0 outline-none bg-transparent text-gray-700"
                              data-testid="input-contact-phone"
                            />
                          </div>
                          <Button type="submit" size="sm" className="w-full" data-testid="btn-submit-contact">
                            Share Contact Details
                          </Button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-primary text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                          : "bg-emerald-500 text-white rounded-tl-xl rounded-tr-xl rounded-br-xl"
                      } p-3`}
                    >
                      {message.type === "agent" && (
                        <p className="text-xs font-medium mb-1 text-emerald-100">Support Agent</p>
                      )}
                      <p className="text-sm">{message.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {isAgentTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-emerald-500 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-100">Agent is typing</span>
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-emerald-200"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-emerald-200"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-emerald-200"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {isConnected && (
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    data-testid="chatbot-input"
                    autoFocus
                  />
                  <Button type="submit" size="icon" data-testid="chatbot-send">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
