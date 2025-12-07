import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Phone, Calendar, MapPin, Check, Headphones, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";

type ChatStep = "greeting" | "event_type" | "date" | "location" | "name" | "phone" | "ask_agent" | "live_chat" | "complete";

interface Message {
  id: string;
  type: "bot" | "user" | "system" | "agent";
  text: string;
  options?: { value: string; label: string; icon?: string }[];
  timestamp?: Date;
}

const eventTypeOptions = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Party" },
  { value: "destination", label: "Destination Event" },
];

const liveAgentOptions = [
  { value: "connect_agent", label: "💬 Chat with Live Agent", icon: "agent" },
  { value: "no_thanks", label: "✓ That's all, thank you!", icon: "done" },
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
  const [step, setStep] = useState<ChatStep>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConnectingToAgent, setIsConnectingToAgent] = useState(false);
  const [formData, setFormData] = useState({
    eventType: "",
    date: "",
    location: "",
    name: "",
    phone: "",
  });
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

  const { isConnected, sendTyping, subscribeToConversation } = useChatWebSocket({
    isAdmin: false,
    visitorId,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
  });

  useEffect(() => {
    if (conversationId && step === 'live_chat') {
      subscribeToConversation(conversationId);
    }
  }, [conversationId, step, subscribeToConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping]);

  const initializeConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          lastMessageAt: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        const conversation = await response.json();
        setConversationId(conversation.id);
        return conversation.id;
      }
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
    }
    return null;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConversation().then((convId) => {
        setTimeout(() => {
          addBotMessage("Hi there! I'm your event planning assistant. What type of event are you planning?", eventTypeOptions, convId);
          setStep("event_type");
        }, 500);
      });
    }
  }, [isOpen]);

  const sendMessageToServer = async (content: string, senderType: string, convId?: string) => {
    const activeConvId = convId || conversationId;
    if (!activeConvId) return;
    
    try {
      await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: senderType === 'visitor' ? visitorId : 'system',
          senderType,
          senderName: senderType === 'visitor' ? formData.name || 'Visitor' : 'DA Assistant',
          content,
          messageType: 'text',
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const addBotMessage = (text: string, options?: { value: string; label: string }[], convId?: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: "bot", text, options, timestamp: new Date() },
      ]);
      setIsTyping(false);
      sendMessageToServer(text, 'system', convId);
    }, 800);
  };

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "system", text, timestamp: new Date() },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "user", text, timestamp: new Date() },
    ]);
    sendMessageToServer(text, 'visitor');
  };

  const handleOptionClick = (value: string, label: string) => {
    addUserMessage(label);
    processStep(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    
    if (step === 'live_chat') {
      if (conversationId) {
        sendTyping(conversationId);
      }
      setInputValue("");
      return;
    }
    
    processStep(inputValue);
    setInputValue("");
  };

  const updateConversationDetails = async (updates: Record<string, any>) => {
    if (!conversationId) return;
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update conversation:", error);
    }
  };

  const requestLiveAgent = async () => {
    if (!conversationId) return;
    
    setIsConnectingToAgent(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/request-live-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        setStep("live_chat");
        addSystemMessage("🎯 You're now connected! Our team has been notified and an agent will join shortly. Feel free to type your questions while you wait.");
        subscribeToConversation(conversationId);
        
        toast({
          title: "Connected!",
          description: "An agent will be with you shortly.",
        });
      } else {
        throw new Error("Failed to connect");
      }
    } catch (error) {
      console.error("Failed to request live agent:", error);
      addBotMessage("Sorry, we couldn't connect you to an agent right now. Please try again or call us directly.");
    } finally {
      setIsConnectingToAgent(false);
    }
  };

  const processStep = async (value: string) => {
    switch (step) {
      case "event_type":
        setFormData((prev) => ({ ...prev, eventType: value }));
        updateConversationDetails({ eventType: value });
        setStep("date");
        addBotMessage("Great choice! When is your event? (You can give me a rough date or month)");
        break;

      case "date":
        setFormData((prev) => ({ ...prev, date: value }));
        updateConversationDetails({ eventDate: value });
        setStep("location");
        addBotMessage("Perfect! Which city or location are you considering?");
        break;

      case "location":
        setFormData((prev) => ({ ...prev, location: value }));
        updateConversationDetails({ eventLocation: value });
        setStep("name");
        addBotMessage("Wonderful! What's your name so we can personalize your experience?");
        break;

      case "name":
        if (value.trim().length < 2) {
          addBotMessage("Please enter your full name (at least 2 characters).");
          return;
        }
        setFormData((prev) => ({ ...prev, name: value.trim() }));
        updateConversationDetails({ visitorName: value.trim() });
        setStep("phone");
        addBotMessage("Thanks, " + value.trim() + "! Last step - what's the best phone number to reach you?");
        break;

      case "phone":
        const phoneRegex = /^[\d\s+\-()]{10,}$/;
        const cleanPhone = value.replace(/\s/g, '');
        
        if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
          addBotMessage("That doesn't look like a valid phone number. Please enter a 10+ digit phone number (e.g., +91 98765 43210).");
          return;
        }
        
        const finalData = { ...formData, phone: value };
        setFormData(finalData);

        updateConversationDetails({ 
          visitorPhone: value,
        });

        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventType: finalData.eventType,
              location: finalData.location,
              name: finalData.name,
              phone: finalData.phone,
              email: `${finalData.phone.replace(/\D/g, '')}@chatbot.lead`,
              leadSource: "chatbot",
              contactMethod: "call",
              message: `Preferred date: ${finalData.date}`,
            }),
          });

          if (!response.ok) throw new Error("Failed to submit");

          setStep("ask_agent");
          addBotMessage(
            `Thank you, ${finalData.name}! Your details have been saved. Would you like to chat with a live agent now, or shall we call you within 24 hours?`,
            liveAgentOptions
          );
          
        } catch (error) {
          addBotMessage("Oops! Something went wrong. Please try again or call us directly.");
        }
        break;

      case "ask_agent":
        if (value === "connect_agent") {
          requestLiveAgent();
        } else {
          setStep("complete");
          addBotMessage(`Perfect! Our team will call you at ${formData.phone} within 24 hours to discuss your ${formData.eventType}. Have a wonderful day! 🌟`);
          
          toast({
            title: "All set!",
            description: "Our team will contact you shortly.",
          });
        }
        break;
    }
  };

  const resetChat = () => {
    setMessages([]);
    setStep("greeting");
    setFormData({
      eventType: "",
      date: "",
      location: "",
      name: "",
      phone: "",
    });
    setConversationId(null);
    setIsOpen(false);
    setIsConnectingToAgent(false);
  };

  const getHeaderTitle = () => {
    if (step === 'live_chat') {
      return "Live Chat Support";
    }
    return "Event Planning Assistant";
  };

  const getHeaderSubtitle = () => {
    if (step === 'live_chat') {
      return isConnected ? "Agent will respond shortly" : "Connecting...";
    }
    return "Typically replies instantly";
  };

  const showInput = step !== "complete" && step !== "event_type" && step !== "ask_agent";

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
            <div className={`p-4 text-white flex items-center justify-between ${step === 'live_chat' ? 'bg-emerald-600' : 'bg-secondary'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center p-1">
                  {step === 'live_chat' ? (
                    <Headphones className="w-6 h-6" />
                  ) : (
                    <img src="/images/icon-white.webp" alt="DA" className="w-full h-full object-contain" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{getHeaderTitle()}</h3>
                  <div className="flex items-center gap-2">
                    {step === 'live_chat' && (
                      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-yellow-300'}`} />
                    )}
                    <p className="text-xs text-white/80">{getHeaderSubtitle()}</p>
                  </div>
                </div>
              </div>
              {(step === "complete" || step === "live_chat") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-white hover:bg-white/20"
                  data-testid="btn-reset-chat"
                >
                  {step === "complete" ? "Start Over" : "End Chat"}
                </Button>
              )}
            </div>

            {step === 'live_chat' && (
              <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
                <p className="text-xs text-emerald-700 text-center">
                  You're chatting with our support team. We'll respond as soon as possible.
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
                      <p className="text-xs text-blue-700 text-center">{message.text}</p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-primary text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                          : message.type === "agent"
                          ? "bg-emerald-500 text-white rounded-tl-xl rounded-tr-xl rounded-br-xl"
                          : "bg-white border rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm"
                      } p-3`}
                    >
                      {message.type === "agent" && (
                        <p className="text-xs font-medium mb-1 text-emerald-100">Support Agent</p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      {message.options && (
                        <div className="mt-3 space-y-2">
                          {message.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleOptionClick(option.value, option.label)}
                              disabled={isConnectingToAgent}
                              className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors border ${
                                option.value === 'connect_agent' 
                                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-medium'
                                  : 'bg-gray-50 hover:bg-primary/10'
                              } ${isConnectingToAgent ? 'opacity-50 cursor-not-allowed' : ''}`}
                              data-testid={`chatbot-option-${option.value}`}
                            >
                              {isConnectingToAgent && option.value === 'connect_agent' ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                  Connecting to agent...
                                </span>
                              ) : (
                                option.label
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {(isTyping || isAgentTyping) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`rounded-xl p-3 shadow-sm ${isAgentTyping ? 'bg-emerald-500' : 'bg-white border'}`}>
                    <div className="flex items-center gap-2">
                      {isAgentTyping && (
                        <span className="text-xs text-emerald-100">Agent is typing</span>
                      )}
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className={`w-2 h-2 rounded-full ${isAgentTyping ? 'bg-emerald-200' : 'bg-gray-400'}`}
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className={`w-2 h-2 rounded-full ${isAgentTyping ? 'bg-emerald-200' : 'bg-gray-400'}`}
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className={`w-2 h-2 rounded-full ${isAgentTyping ? 'bg-emerald-200' : 'bg-gray-400'}`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {showInput && (
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      step === "live_chat"
                        ? "Type your message..."
                        : step === "date"
                        ? "e.g., March 2025"
                        : step === "location"
                        ? "e.g., Mumbai, Udaipur"
                        : step === "name"
                        ? "Your name"
                        : step === "phone"
                        ? "+91 98765 43210"
                        : "Type a message..."
                    }
                    className="flex-1"
                    data-testid="chatbot-input"
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
