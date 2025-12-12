import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { useBranding } from "@/contexts/BrandingContext";

type ChatPhase = "collecting" | "submitted" | "live" | "ended";
type CollectionStep = "welcome" | "name" | "phone" | "email";

interface Message {
  id: string;
  type: "bot" | "user" | "system" | "agent";
  text: string;
  timestamp?: Date;
}

interface CollectedData {
  name: string;
  phone: string;
  email: string;
}

interface ExistingSession {
  conversationId: string;
  phase: ChatPhase;
  collectedData: CollectedData;
}

const SESSION_KEY = 'da_chat_session';

function getVisitorId(): string {
  let visitorId = localStorage.getItem('da_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('da_visitor_id', visitorId);
  }
  return visitorId;
}

function saveSession(session: ExistingSession | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function getSession(): ExistingSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse session:", e);
  }
  return null;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [phase, setPhase] = useState<ChatPhase>("collecting");
  const [collectionStep, setCollectionStep] = useState<CollectionStep>("welcome");
  const [collectedData, setCollectedData] = useState<CollectedData>({
    name: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const chatInitializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { branding } = useBranding();
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

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback((data: any) => {
    if (data.senderType === 'admin' && data.conversationId === conversationId) {
      setIsAgentTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => setIsAgentTyping(false), 3000);
    }
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const { isConnected: wsConnected, sendTyping, subscribeToConversation } = useChatWebSocket({
    isAdmin: false,
    visitorId,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
  });

  useEffect(() => {
    if (conversationId && phase === "live") {
      subscribeToConversation(conversationId);
    }
  }, [conversationId, phase, subscribeToConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping]);

  useEffect(() => {
    if (conversationId && (phase === "submitted" || phase === "live")) {
      saveSession({
        conversationId,
        phase,
        collectedData,
      });
    }
  }, [conversationId, phase, collectedData]);

  useEffect(() => {
    const restoreSession = async () => {
      if (sessionRestored) return;
      setSessionRestored(true);

      const existingSession = getSession();
      if (existingSession && existingSession.conversationId) {
        try {
          const response = await fetch(`/api/conversations/visitor/${visitorId}`);
          if (response.ok) {
            const conv = await response.json();
            if (conv && conv.status !== 'closed' && conv.status !== 'ended') {
              setConversationId(existingSession.conversationId);
              setCollectedData(existingSession.collectedData);
              
              if (conv.phase === 'live' || conv.status === 'live_agent') {
                setPhase("live");
              } else if (conv.leadId || conv.phase === 'submitted') {
                setPhase("submitted");
              }

              const messagesResponse = await fetch(`/api/conversations/${existingSession.conversationId}/messages`);
              if (messagesResponse.ok) {
                const existingMessages = await messagesResponse.json();
                const formattedMessages: Message[] = existingMessages.map((msg: any) => ({
                  id: msg.id,
                  type: msg.senderType === 'visitor' ? 'user' : 
                        msg.senderType === 'system' ? 'system' : 
                        msg.senderType === 'admin' ? 'agent' : 'bot',
                  text: msg.content,
                  timestamp: new Date(msg.createdAt),
                }));
                setMessages(formattedMessages);
              }
              chatInitializedRef.current = true;
              return;
            }
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
        }
        saveSession(null);
      }
    };

    if (isOpen && !sessionRestored) {
      restoreSession();
    }
  }, [isOpen, visitorId, sessionRestored]);

  useEffect(() => {
    if (!isOpen || chatInitializedRef.current || phase !== "collecting" || !sessionRestored) {
      return;
    }
    
    chatInitializedRef.current = true;
    
    const t1 = setTimeout(() => {
      setMessages([
        {
          id: "welcome-1",
          type: "bot",
          text: "👋 Welcome to DA Creation! I'm here to help you plan your perfect event.",
          timestamp: new Date(),
        },
      ]);
    }, 500);
    
    const t2 = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: "welcome-2",
          type: "bot",
          text: "To get started, may I have your name?",
          timestamp: new Date(),
        },
      ]);
      setCollectionStep("name");
    }, 1300);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, phase, sessionRestored]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "bot",
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "user",
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "system",
        text,
        timestamp: new Date(),
      },
    ]);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s+\-()]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCollectionInput = async (value: string) => {
    addUserMessage(value);

    switch (collectionStep) {
      case "name":
        if (value.trim().length < 2) {
          setTimeout(() => addBotMessage("Please enter a valid name (at least 2 characters)."), 500);
          return;
        }
        setCollectedData((prev) => ({ ...prev, name: value.trim() }));
        setTimeout(() => {
          addBotMessage(`Nice to meet you, ${value.trim()}! 📞 What's your phone number?`);
          setCollectionStep("phone");
        }, 500);
        break;

      case "phone":
        if (!validatePhone(value)) {
          setTimeout(() => addBotMessage("Please enter a valid phone number (at least 10 digits)."), 500);
          return;
        }
        setCollectedData((prev) => ({ ...prev, phone: value.trim() }));
        setTimeout(() => {
          addBotMessage("Great! 📧 What's your email address?");
          setCollectionStep("email");
        }, 500);
        break;

      case "email":
        if (!validateEmail(value)) {
          setTimeout(() => addBotMessage("Please enter a valid email address."), 500);
          return;
        }
        const updatedData = { ...collectedData, email: value.trim() };
        setCollectedData(updatedData);
        setIsSubmitting(true);
        setTimeout(() => {
          addBotMessage("Thank you for providing your contact details!");
        }, 300);
        setTimeout(() => {
          handleSubmitContact(updatedData);
        }, 800);
        break;

      default:
        break;
    }
    setInputValue("");
  };

  const handleSubmitContact = async (data: CollectedData) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          visitorName: data.name,
          visitorPhone: data.phone,
          visitorEmail: data.email,
          lastMessageAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const conversation = await response.json();
      setConversationId(conversation.id);

      setPhase("submitted");
      addSystemMessage("✅ Your details have been saved. How would you like to proceed?");

    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to save your details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndChat = async () => {
    if (conversationId) {
      try {
        await fetch(`/api/conversations/${conversationId}/end-chat`, { method: "POST" });
      } catch (error) {
        console.error("End chat error:", error);
      }
    }
    setPhase("ended");
    addSystemMessage("👋 Thank you for reaching out! We will get back to you soon. Have a great day!");
    saveSession(null);
  };

  const handleConnectLiveAgent = async () => {
    setIsConnecting(true);
    try {
      if (!conversationId) throw new Error("No conversation");

      const response = await fetch(`/api/conversations/${conversationId}/request-live-agent`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to connect to agent");

      setPhase("live");
      subscribeToConversation(conversationId);
      addSystemMessage("🎧 You're now connected to our live support team. An agent will join shortly!");
      
      toast({
        title: "Connected!",
        description: "An agent will be with you shortly.",
      });
    } catch (error) {
      console.error("Live agent error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to live agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessageToServer = async (content: string) => {
    if (!conversationId) return;

    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: visitorId,
          senderType: 'visitor',
          senderName: collectedData.name || 'Visitor',
          content,
          messageType: 'text',
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLiveChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    addUserMessage(messageText);
    setInputValue("");

    if (conversationId) {
      sendTyping(conversationId);
      await sendMessageToServer(messageText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (phase === "live") {
      handleLiveChatSubmit(e);
    } else if (phase === "collecting") {
      handleCollectionInput(inputValue.trim());
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setPhase("collecting");
    setCollectionStep("welcome");
    setCollectedData({
      name: "",
      phone: "",
      email: "",
    });
    setSessionRestored(false);
    chatInitializedRef.current = false;
    saveSession(null);
    setIsOpen(false);
  };

  const startNewChat = () => {
    resetChat();
    setIsOpen(true);
  };

  const renderActionButtons = () => {
    if (phase === "submitted") {
      return (
        <div className="p-4 border-t bg-white space-y-2">
          <p className="text-sm text-center text-muted-foreground mb-3">What would you like to do?</p>
          <div className="flex gap-2">
            <Button
              onClick={handleEndChat}
              variant="outline"
              className="flex-1"
              data-testid="btn-end-chat"
            >
              <X className="w-4 h-4 mr-2" />
              End Chat
            </Button>
            <Button
              onClick={handleConnectLiveAgent}
              disabled={isConnecting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              data-testid="btn-connect-agent"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Headphones className="w-4 h-4 mr-2" />
                  Connect to Live Agent
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    if (phase === "ended") {
      return (
        <div className="p-4 border-t bg-white">
          <Button onClick={startNewChat} className="w-full" data-testid="btn-new-chat">
            <MessageCircle className="w-4 h-4 mr-2" />
            Start New Chat
          </Button>
        </div>
      );
    }

    if (phase === "live" || (phase === "collecting" && collectionStep !== "welcome")) {
      if (isSubmitting) {
        return (
          <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-center gap-2 py-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Saving your details...</span>
            </div>
          </div>
        );
      }
      return (
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={phase === "live" ? "Type your message..." : getPlaceholder()}
              className="flex-1"
              data-testid="chatbot-input"
              autoFocus
            />
            <Button type="submit" size="icon" data-testid="chatbot-send">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      );
    }

    return null;
  };

  const getPlaceholder = () => {
    switch (collectionStep) {
      case "name":
        return "Enter your name...";
      case "phone":
        return "Enter your phone number...";
      case "email":
        return "Enter your email...";
      default:
        return "Type your message...";
    }
  };

  const getHeaderTitle = () => {
    if (phase === "live") return "Live Chat Support";
    if (phase === "ended") return "Chat Ended";
    return "DA Creation Assistant";
  };

  const getHeaderSubtitle = () => {
    if (phase === "live") {
      return wsConnected ? "Connected" : "Reconnecting...";
    }
    if (phase === "ended") return "Thank you for chatting";
    if (phase === "submitted") return "Ready to help";
    return "Let us plan your event";
  };

  return (
    <div className="floating-widget">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 md:bottom-16 md:left-6 md:right-auto z-50 w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors"
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
              <MessageCircle className="w-7 h-7" />
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
            className="fixed bottom-40 right-4 md:bottom-32 md:left-6 md:right-auto z-50 w-[340px] md:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border"
            data-testid="chatbot-window"
          >
            <div className="bg-secondary text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{getHeaderTitle()}</h3>
                    <p className="text-xs text-white/80">{getHeaderSubtitle()}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                  data-testid="chatbot-close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="h-[350px] overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "system" ? (
                    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-[90%] text-center mx-auto border border-blue-100">
                      {message.text}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        message.type === "user"
                          ? "bg-secondary text-white rounded-br-md"
                          : message.type === "agent"
                          ? "bg-emerald-100 text-emerald-900 rounded-bl-md"
                          : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                      }`}
                    >
                      {message.type === "agent" && (
                        <div className="text-xs text-emerald-600 font-medium mb-1">Agent</div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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
                  <div className="bg-emerald-100 text-emerald-900 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {renderActionButtons()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
