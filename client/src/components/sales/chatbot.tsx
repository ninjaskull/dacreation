import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, User, Phone, Mail, Calendar, MapPin, Users, IndianRupee, ChevronRight, Check, Headphones, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";

type ChatPhase = "collecting" | "submitted" | "live" | "ended";
type CollectionStep = "welcome" | "name" | "phone" | "email" | "eventType" | "guestCount" | "eventDate" | "location" | "budget" | "confirm";

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
  eventType: string;
  guestCount: string;
  eventDate: string;
  location: string;
  budget: string;
}

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "anniversary", label: "Anniversary" },
  { value: "destination", label: "Destination Event" },
  { value: "other", label: "Other" },
];

const BUDGET_RANGES = [
  { value: "under-5l", label: "Under ₹5 Lakhs" },
  { value: "5l-10l", label: "₹5 - 10 Lakhs" },
  { value: "10l-25l", label: "₹10 - 25 Lakhs" },
  { value: "25l-50l", label: "₹25 - 50 Lakhs" },
  { value: "50l-1cr", label: "₹50 Lakhs - 1 Crore" },
  { value: "above-1cr", label: "Above ₹1 Crore" },
  { value: "flexible", label: "Flexible / Not Sure" },
];

function getVisitorId(): string {
  let visitorId = localStorage.getItem('da_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('da_visitor_id', visitorId);
  }
  return visitorId;
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
    eventType: "",
    guestCount: "",
    eventDate: "",
    location: "",
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
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
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("👋 Welcome to DA Creation! I'm here to help you plan your perfect event.");
        setTimeout(() => {
          addBotMessage("Let me collect a few details to understand your requirements better. What's your name?");
          setCollectionStep("name");
        }, 800);
      }, 500);
    }
  }, [isOpen]);

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
        setCollectedData((prev) => ({ ...prev, email: value.trim() }));
        setTimeout(() => {
          addBotMessage("Perfect! 🎉 What type of event are you planning?");
          setCollectionStep("eventType");
        }, 500);
        break;

      case "guestCount":
        const count = parseInt(value);
        if (isNaN(count) || count < 1) {
          setTimeout(() => addBotMessage("Please enter a valid number of guests."), 500);
          return;
        }
        setCollectedData((prev) => ({ ...prev, guestCount: value.trim() }));
        setTimeout(() => {
          addBotMessage("📅 When are you planning this event? (e.g., March 2025)");
          setCollectionStep("eventDate");
        }, 500);
        break;

      case "eventDate":
        setCollectedData((prev) => ({ ...prev, eventDate: value.trim() }));
        setTimeout(() => {
          addBotMessage("📍 Where would you like to host the event?");
          setCollectionStep("location");
        }, 500);
        break;

      case "location":
        setCollectedData((prev) => ({ ...prev, location: value.trim() }));
        setTimeout(() => {
          addBotMessage("💰 What's your approximate budget range?");
          setCollectionStep("budget");
        }, 500);
        break;

      default:
        break;
    }
    setInputValue("");
  };

  const handleEventTypeSelect = (eventType: string, label: string) => {
    addUserMessage(label);
    setCollectedData((prev) => ({ ...prev, eventType }));
    setTimeout(() => {
      addBotMessage(`${label} - excellent choice! 👥 How many guests are you expecting?`);
      setCollectionStep("guestCount");
    }, 500);
  };

  const handleBudgetSelect = async (budget: string, label: string) => {
    addUserMessage(label);
    const updatedData = { ...collectedData, budget };
    setCollectedData(updatedData);
    
    setTimeout(() => {
      addBotMessage("Thank you for providing all the details! Submitting your inquiry...");
    }, 300);
    
    setTimeout(() => {
      handleDirectSubmit(updatedData);
    }, 800);
  };

  const handleDirectSubmit = async (data: CollectedData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          visitorName: data.name,
          visitorPhone: data.phone,
          visitorEmail: data.email,
          eventType: data.eventType,
          eventDate: data.eventDate,
          eventLocation: data.location,
          budgetRange: data.budget,
          guestCount: parseInt(data.guestCount) || null,
          lastMessageAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const conversation = await response.json();
      setConversationId(conversation.id);

      const leadResponse = await fetch(`/api/conversations/${conversation.id}/submit-lead`, {
        method: "POST",
      });

      if (!leadResponse.ok) throw new Error("Failed to submit lead");

      setPhase("submitted");
      addSystemMessage("✅ Your inquiry has been submitted successfully! Our team will contact you soon.");
      setTimeout(() => {
        addBotMessage("What would you like to do next?");
      }, 800);

    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to submit your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          visitorName: collectedData.name,
          visitorPhone: collectedData.phone,
          visitorEmail: collectedData.email,
          eventType: collectedData.eventType,
          eventDate: collectedData.eventDate,
          eventLocation: collectedData.location,
          budgetRange: collectedData.budget,
          guestCount: parseInt(collectedData.guestCount) || null,
          lastMessageAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create conversation");

      const conversation = await response.json();
      setConversationId(conversation.id);

      const leadResponse = await fetch(`/api/conversations/${conversation.id}/submit-lead`, {
        method: "POST",
      });

      if (!leadResponse.ok) throw new Error("Failed to submit lead");

      setPhase("submitted");
      addSystemMessage("✅ Your inquiry has been submitted successfully! Our team will contact you soon.");
      setTimeout(() => {
        addBotMessage("What would you like to do next?");
      }, 800);

    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to submit your inquiry. Please try again.",
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
      eventType: "",
      guestCount: "",
      eventDate: "",
      location: "",
      budget: "",
    });
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
                  Talk to Agent
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

    if (phase === "collecting" && collectionStep === "eventType") {
      return (
        <div className="p-4 border-t bg-white">
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map((event) => (
              <Button
                key={event.value}
                variant="outline"
                size="sm"
                onClick={() => handleEventTypeSelect(event.value, event.label)}
                className="text-xs justify-start"
                data-testid={`btn-event-${event.value}`}
              >
                {event.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    if (phase === "collecting" && collectionStep === "budget") {
      return (
        <div className="p-4 border-t bg-white">
          <div className="grid grid-cols-2 gap-2">
            {BUDGET_RANGES.map((budget) => (
              <Button
                key={budget.value}
                variant="outline"
                size="sm"
                onClick={() => handleBudgetSelect(budget.value, budget.label)}
                className="text-xs justify-start"
                data-testid={`btn-budget-${budget.value}`}
              >
                {budget.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    if (phase === "live" || (phase === "collecting" && !["eventType", "budget", "welcome"].includes(collectionStep))) {
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
      case "guestCount":
        return "Number of guests...";
      case "eventDate":
        return "E.g., March 2025...";
      case "location":
        return "Event location...";
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
    if (phase === "submitted") return "Inquiry submitted";
    return "Let us plan your event";
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
            className="fixed bottom-40 right-4 md:bottom-24 md:left-6 md:right-auto z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl shadow-2xl border overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
            data-testid="chatbot-window"
          >
            <div className={`p-4 text-white flex items-center justify-between ${phase === "live" ? "bg-emerald-600" : phase === "ended" ? "bg-gray-600" : "bg-primary"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1">
                  {phase === "live" ? (
                    <Headphones className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{getHeaderTitle()}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      phase === "live" 
                        ? (wsConnected ? 'bg-green-300' : 'bg-yellow-300 animate-pulse') 
                        : phase === "ended" 
                          ? 'bg-gray-300'
                          : 'bg-green-300'
                    }`} />
                    <p className="text-xs text-white/80">{getHeaderSubtitle()}</p>
                  </div>
                </div>
              </div>
              {phase !== "ended" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-white hover:bg-white/20"
                  data-testid="btn-close-chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {phase === "collecting" && (
              <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                <p className="text-xs text-blue-700 text-center">
                  Step {getStepNumber(collectionStep)} of 8: {getStepLabel(collectionStep)}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
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
                      <p className="text-xs text-blue-700 text-center whitespace-pre-line">{message.text}</p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-primary text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                          : message.type === "agent"
                            ? "bg-emerald-500 text-white rounded-tl-xl rounded-tr-xl rounded-br-xl"
                            : "bg-white text-gray-800 rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm border"
                      } p-3`}
                    >
                      {message.type === "agent" && (
                        <p className="text-xs font-medium mb-1 text-emerald-100">Support Agent</p>
                      )}
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {isAgentTyping && phase === "live" && (
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

            {renderActionButtons()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStepNumber(step: CollectionStep): number {
  const steps: Record<CollectionStep, number> = {
    welcome: 1,
    name: 1,
    phone: 2,
    email: 3,
    eventType: 4,
    guestCount: 5,
    eventDate: 6,
    location: 7,
    budget: 8,
    confirm: 8,
  };
  return steps[step] || 1;
}

function getStepLabel(step: CollectionStep): string {
  const labels: Record<CollectionStep, string> = {
    welcome: "Welcome",
    name: "Your Name",
    phone: "Phone Number",
    email: "Email Address",
    eventType: "Event Type",
    guestCount: "Guest Count",
    eventDate: "Event Date",
    location: "Location",
    budget: "Budget",
    confirm: "Confirm Details",
  };
  return labels[step] || "Welcome";
}
