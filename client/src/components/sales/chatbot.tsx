import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, User, Phone, Calendar, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ChatStep = "greeting" | "event_type" | "date" | "location" | "name" | "phone" | "complete";

interface Message {
  id: string;
  type: "bot" | "user";
  text: string;
  options?: { value: string; label: string }[];
}

const eventTypeOptions = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Party" },
  { value: "destination", label: "Destination Event" },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    eventType: "",
    date: "",
    location: "",
    name: "",
    phone: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hi there! I'm your event planning assistant. What type of event are you planning?", eventTypeOptions);
        setStep("event_type");
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, options?: { value: string; label: string }[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), type: "bot", text, options },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "user", text },
    ]);
  };

  const handleOptionClick = (value: string, label: string) => {
    addUserMessage(label);
    processStep(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    processStep(inputValue);
    setInputValue("");
  };

  const processStep = async (value: string) => {
    switch (step) {
      case "event_type":
        setFormData((prev) => ({ ...prev, eventType: value }));
        setStep("date");
        addBotMessage("Great choice! When is your event? (You can give me a rough date or month)");
        break;

      case "date":
        setFormData((prev) => ({ ...prev, date: value }));
        setStep("location");
        addBotMessage("Perfect! Which city or location are you considering?");
        break;

      case "location":
        setFormData((prev) => ({ ...prev, location: value }));
        setStep("name");
        addBotMessage("Wonderful! What's your name so we can personalize your experience?");
        break;

      case "name":
        if (value.trim().length < 2) {
          addBotMessage("Please enter your full name (at least 2 characters).");
          return;
        }
        setFormData((prev) => ({ ...prev, name: value.trim() }));
        setStep("phone");
        addBotMessage("Thanks, " + value.trim() + "! Last step - what's the best phone number to reach you? Our team will call within 24 hours.");
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
        setStep("complete");

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

          addBotMessage(`Thank you, ${finalData.name}! Your information has been received. One of our expert planners will call you at ${finalData.phone} within 24 hours to discuss your ${finalData.eventType}. Have a great day!`);
          
          toast({
            title: "Details Received!",
            description: "Our team will contact you shortly.",
          });
        } catch (error) {
          addBotMessage("Oops! Something went wrong. Please try again or call us directly at +91-9876543210.");
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
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors"
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
              <Bot className="w-6 h-6" />
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
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
            data-testid="chatbot-window"
          >
            <div className="bg-secondary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Event Planning Assistant</h3>
                  <p className="text-xs text-white/80">Typically replies instantly</p>
                </div>
              </div>
              {step === "complete" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-white hover:bg-white/20"
                >
                  Start Over
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.type === "user"
                        ? "bg-primary text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                        : "bg-white border rounded-tl-xl rounded-tr-xl rounded-br-xl shadow-sm"
                    } p-3`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleOptionClick(option.value, option.label)}
                            className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-primary/10 rounded-lg transition-colors border"
                            data-testid={`chatbot-option-${option.value}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border rounded-xl p-3 shadow-sm">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {step !== "complete" && step !== "event_type" && (
              <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      step === "date"
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
    </>
  );
}
