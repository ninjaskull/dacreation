import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import { 
  MessageSquare, 
  Search,
  Send,
  Phone,
  Mail,
  Calendar,
  Circle,
  CheckCircle2,
  Archive,
  MoreVertical,
  Paperclip,
  Smile,
  Wifi,
  WifiOff,
  User,
  Clock,
  ChevronDown,
  X,
  Headphones,
  MapPin,
  IndianRupee,
  AlertCircle,
  ExternalLink,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";

const QUICK_REPLIES = [
  { label: "Greeting", text: "Hi! Thank you for reaching out. How can I help you today?" },
  { label: "Pricing", text: "Our event packages start from ₹5 Lakhs. Would you like me to share detailed pricing based on your requirements?" },
  { label: "Availability", text: "Let me check our availability for your preferred date. Could you please confirm the date you have in mind?" },
  { label: "Callback", text: "I'd be happy to have our event specialist call you. What's the best time to reach you?" },
  { label: "Follow-up", text: "Is there anything else I can help you with today?" },
  { label: "Thanks", text: "Thank you for choosing Da Creation! We look forward to making your event memorable." },
];
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Conversation = {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  eventType: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  budgetRange: string | null;
  status: string;
  assignedTo: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  wantsLiveAgent: boolean;
  liveAgentRequestedAt: string | null;
  unreadCount?: number;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  senderName: string | null;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
};

type ConversationStats = {
  total: number;
  active: number;
  waiting: number;
  live_agent: number;
  resolved: number;
  archived: number;
  unreadMessages: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string; urgent?: boolean }> = {
  live_agent: { label: "Live Agent", color: "text-red-600", bgColor: "bg-red-50", dotColor: "bg-red-500", urgent: true },
  active: { label: "Active", color: "text-emerald-600", bgColor: "bg-emerald-50", dotColor: "bg-emerald-500" },
  waiting: { label: "Waiting", color: "text-amber-600", bgColor: "bg-amber-50", dotColor: "bg-amber-500" },
  resolved: { label: "Resolved", color: "text-blue-600", bgColor: "bg-blue-50", dotColor: "bg-blue-500" },
  archived: { label: "Archived", color: "text-slate-600", bgColor: "bg-slate-50", dotColor: "bg-slate-400" },
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  wedding: "bg-pink-100 text-pink-700",
  corporate: "bg-blue-100 text-blue-700",
  social: "bg-purple-100 text-purple-700",
  destination: "bg-teal-100 text-teal-700",
  birthday: "bg-orange-100 text-orange-700",
  anniversary: "bg-rose-100 text-rose-700",
};

function formatMessageTime(date: string): string {
  const d = new Date(date);
  if (isToday(d)) {
    return format(d, "h:mm a");
  }
  if (isYesterday(d)) {
    return "Yesterday";
  }
  return format(d, "MMM d");
}

function formatMessageGroupDate(date: string): string {
  const d = new Date(date);
  if (isToday(d)) {
    return "Today";
  }
  if (isYesterday(d)) {
    return "Yesterday";
  }
  return format(d, "MMMM d, yyyy");
}

function getInitials(name: string | null): string {
  if (!name) return "V";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function groupMessagesByDate(messages: ChatMessage[]): Map<string, ChatMessage[]> {
  const groups = new Map<string, ChatMessage[]>();
  messages.forEach((message) => {
    const dateKey = format(new Date(message.createdAt), "yyyy-MM-dd");
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  });
  return groups;
}

const BUDGET_LABELS: Record<string, string> = {
  "under-5l": "Under ₹5L",
  "5l-10l": "₹5-10L",
  "10l-25l": "₹10-25L",
  "25l-50l": "₹25-50L",
  "50l-1cr": "₹50L-1Cr",
  "above-1cr": "Above ₹1Cr",
  "flexible": "Flexible",
};

function formatBudget(budget: string | null): string {
  if (!budget) return "Not specified";
  return BUDGET_LABELS[budget] || budget;
}

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQQNZ7X/8p5JESNPpvfvkjMQHT+X6vCRNg8iQJnt75E5DyI/l+vwkjcQIz6W6u+ROQ4iP5fq75E4DyM+luvwkjkPIz6W6++RNw8jP5fr8JE5DyI+luvvkTgQIj6X6/CROQ8iPpbr75E4DyM+l+vwkTkPIj6W6++ROA8jPpfr8JE5DyI+luvvkTgPIz6X6/CROQ8iPpbr75E4DyM+l+vwkTkPIj6W6++ROA8jPpfr8JE5DyI+luvvkTgPIz6X6/CROQ8iPpbr75I4ECI+l+vwkTkPIj6W6++ROA8jPpfr8JE5DyI+luvvkTgPIz6X6/CROQ8iPpbr75E4DyM+l+vwkTkPIj6W6++ROA8jPpfr8JE5DyI=");
    audioRef.current.volume = 0.5;
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  const { isConnected, typingUsers, sendTyping, subscribeToConversation } = useChatWebSocket({
    isAdmin: true,
    userId: "admin",
    onMessage: useCallback((message: any) => {
      scrollToBottom();
      playNotificationSound();
      
      if (message.type === "live_agent_request") {
        toast({
          title: "🔴 Live Agent Request!",
          description: `${message.visitorName || "A visitor"} wants to talk to a live agent`,
          variant: "destructive",
          duration: 10000,
        });
      }
    }, [playNotificationSound, toast]),
  });

  useEffect(() => {
    if (selectedConversation?.id) {
      subscribeToConversation(selectedConversation.id);
    }
  }, [selectedConversation?.id, subscribeToConversation]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations", filterStatus, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (search) params.append("search", search);
      const response = await fetch(`/api/conversations${params.toString() ? `?${params}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["conversationStats"],
    queryFn: async () => {
      const response = await fetch("/api/conversations/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<ConversationStats>;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chatMessages", selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<ChatMessage[]>;
    },
    enabled: !!selectedConversation,
  });

  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: "admin",
          senderType: "admin",
          senderName: "DA Support",
          content,
          messageType: "text",
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["chatMessages", selectedConversation?.id] });
      if (selectedConversation && selectedConversation.status !== "active") {
        updateConversationMutation.mutate({
          id: selectedConversation.id,
          data: { status: "active", lastMessageAt: new Date().toISOString() },
        });
      }
      scrollToBottom();
      inputRef.current?.focus();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedConversation) {
      fetch(`/api/conversations/${selectedConversation.id}/mark-read`, { method: "POST" });
    }
  }, [selectedConversation?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        content: messageInput.trim(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    if (selectedConversation) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTyping(selectedConversation.id);
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleStatusChange = (conversationId: string, newStatus: string) => {
    updateConversationMutation.mutate({
      id: conversationId,
      data: { status: newStatus },
    });
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const messageGroups = groupMessagesByDate(messages);
  const isTyping = selectedConversation && typingUsers.has(selectedConversation.id);

  return (
    <AdminLayout title="Live Chat" description="Real-time customer support">
      <TooltipProvider>
        <div className="h-[calc(100vh-140px)] flex bg-background rounded-xl border shadow-sm overflow-hidden">
          <div className="w-80 border-r flex flex-col bg-muted/30">
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">Conversations</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-emerald-500" : "bg-red-500"
                      )} />
                    </TooltipTrigger>
                    <TooltipContent>
                      {isConnected ? "Connected" : "Disconnected"}
                    </TooltipContent>
                  </Tooltip>
                </div>
                {stats?.unreadMessages && stats.unreadMessages > 0 && (
                  <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-xs">
                    {stats.unreadMessages}
                  </Badge>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9 h-9 bg-muted/50" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="input-search-conversations"
                />
              </div>

              <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
                {[
                  { key: "all", label: "All", count: stats?.total },
                  { key: "live_agent", label: "🔴 Live Agent", count: stats?.live_agent, urgent: true },
                  { key: "active", label: "Active", count: stats?.active },
                  { key: "waiting", label: "Waiting", count: stats?.waiting },
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    variant={filterStatus === filter.key ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus(filter.key)}
                    className={cn(
                      "h-7 text-xs px-2.5 shrink-0",
                      filterStatus === filter.key && "font-medium"
                    )}
                    data-testid={`filter-${filter.key}`}
                  >
                    {filter.label}
                    {filter.count !== undefined && filter.count > 0 && (
                      <span className="ml-1.5 opacity-60">({filter.count})</span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No conversations</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const statusConfig = STATUS_CONFIG[conversation.status] || STATUS_CONFIG.active;
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all mb-1",
                          isSelected 
                            ? "bg-primary/10 border border-primary/20" 
                            : "hover:bg-muted/80"
                        )}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10 border">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium text-sm">
                                {getInitials(conversation.visitorName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                              statusConfig.dotColor
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm truncate">
                                {conversation.visitorName || `Visitor ${conversation.visitorId.slice(-6)}`}
                              </p>
                              {conversation.lastMessageAt && (
                                <span className="text-[11px] text-muted-foreground shrink-0">
                                  {formatMessageTime(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {conversation.status === 'live_agent' && (
                                <Badge 
                                  variant="destructive" 
                                  className="text-[10px] px-1.5 py-0 h-4 font-medium animate-pulse"
                                >
                                  <Headphones className="w-3 h-3 mr-0.5" />
                                  Live
                                </Badge>
                              )}
                              {conversation.eventType && (
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 h-4 font-normal",
                                    EVENT_TYPE_COLORS[conversation.eventType] || "bg-slate-100 text-slate-700"
                                  )}
                                >
                                  {conversation.eventType}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground truncate">
                                {conversation.visitorPhone || conversation.visitorEmail || "No contact"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="h-16 px-4 border-b flex items-center justify-between bg-background">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                        {getInitials(selectedConversation.visitorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {selectedConversation.visitorName || `Visitor ${selectedConversation.visitorId.slice(-6)}`}
                        </h3>
                        {selectedConversation.status === 'live_agent' ? (
                          <Badge 
                            variant="destructive" 
                            className="text-[10px] h-5 animate-pulse"
                          >
                            <Headphones className="w-3 h-3 mr-1" />
                            Live Agent
                          </Badge>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] h-5", STATUS_CONFIG[selectedConversation.status]?.color)}
                          >
                            {STATUS_CONFIG[selectedConversation.status]?.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-3">
                        {selectedConversation.eventType && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {selectedConversation.eventType}
                          </span>
                        )}
                        {selectedConversation.visitorPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {selectedConversation.visitorPhone}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {selectedConversation.status !== "resolved" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(selectedConversation.id, "resolved")}
                        className="h-8"
                        data-testid="btn-resolve"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Resolve
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedConversation.id, "active")}>
                          <Circle className="w-4 h-4 mr-2 text-emerald-500 fill-current" />
                          Mark as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(selectedConversation.id, "waiting")}>
                          <Clock className="w-4 h-4 mr-2 text-amber-500" />
                          Mark as Waiting
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(selectedConversation.id, "archived")}
                          className="text-destructive"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 bg-muted/20">
                  <div className="p-4 space-y-6 min-h-full">
                    {Array.from(messageGroups.entries()).map(([dateKey, dateMessages]) => (
                      <div key={dateKey}>
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-muted px-3 py-1 rounded-full">
                            <span className="text-xs text-muted-foreground font-medium">
                              {formatMessageGroupDate(dateMessages[0].createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {dateMessages.map((message, idx) => {
                            const isAdmin = message.senderType === "admin";
                            const isSystem = message.senderType === "system";
                            const showAvatar = idx === 0 || dateMessages[idx - 1]?.senderType !== message.senderType;
                            
                            return (
                              <div
                                key={message.id}
                                className={cn(
                                  "flex gap-2",
                                  isAdmin ? "justify-end" : "justify-start"
                                )}
                              >
                                {!isAdmin && showAvatar && (
                                  <Avatar className="w-8 h-8 mt-1">
                                    <AvatarFallback className={cn(
                                      "text-xs",
                                      isSystem ? "bg-slate-200" : "bg-primary/10 text-primary"
                                    )}>
                                      {isSystem ? "🤖" : getInitials(message.senderName)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                {!isAdmin && !showAvatar && <div className="w-8" />}
                                
                                <div className={cn(
                                  "max-w-[65%] group",
                                  isAdmin && "order-first"
                                )}>
                                  {showAvatar && !isAdmin && (
                                    <p className="text-xs text-muted-foreground mb-1 ml-1">
                                      {isSystem ? "Bot" : message.senderName || "Visitor"}
                                    </p>
                                  )}
                                  <div
                                    className={cn(
                                      "px-4 py-2.5 rounded-2xl shadow-sm",
                                      isAdmin
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : isSystem
                                        ? "bg-slate-100 border rounded-bl-md"
                                        : "bg-white border rounded-bl-md"
                                    )}
                                  >
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                  </div>
                                  <p className={cn(
                                    "text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                    isAdmin ? "text-right mr-1" : "ml-1",
                                    "text-muted-foreground"
                                  )}>
                                    {format(new Date(message.createdAt), "h:mm a")}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-2 items-center">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(selectedConversation.visitorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t bg-background">
                  {showQuickReplies && (
                    <div className="p-3 border-b bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Quick Replies</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowQuickReplies(false)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_REPLIES.map((reply, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setMessageInput(reply.text);
                              setShowQuickReplies(false);
                              inputRef.current?.focus();
                            }}
                            data-testid={`quick-reply-${idx}`}
                          >
                            {reply.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant={showQuickReplies ? "secondary" : "ghost"} 
                              size="icon" 
                              className="h-12 w-12 rounded-xl shrink-0"
                              onClick={() => setShowQuickReplies(!showQuickReplies)}
                            >
                              <Zap className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Quick Replies</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-12 w-12 rounded-xl shrink-0"
                              onClick={() => setSoundEnabled(!soundEnabled)}
                            >
                              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{soundEnabled ? "Mute notifications" : "Enable notifications"}</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={messageInput}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          className="pr-10 py-6 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
                          data-testid="input-chat-message"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Smile className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={!messageInput.trim() || isSending}
                        className="h-12 w-12 rounded-xl shrink-0"
                        data-testid="button-send-message"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">Select a conversation</h3>
                  <p className="text-muted-foreground text-sm">Choose from your existing conversations or wait for new ones</p>
                </div>
              </div>
            )}
          </div>

          {selectedConversation && showDetails && (
            <div className="w-72 border-l bg-background flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Contact Details</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetails(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {selectedConversation.status === 'live_agent' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
                        <Headphones className="w-4 h-4 animate-pulse" />
                        <span>Live Agent Requested</span>
                      </div>
                      {selectedConversation.liveAgentRequestedAt && (
                        <p className="text-xs text-red-500 mt-1">
                          {formatDistanceToNow(new Date(selectedConversation.liveAgentRequestedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-16 h-16 border-2">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-medium">
                        {getInitials(selectedConversation.visitorName)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium mt-3">
                      {selectedConversation.visitorName || `Visitor ${selectedConversation.visitorId.slice(-6)}`}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={cn("mt-1", STATUS_CONFIG[selectedConversation.status]?.bgColor, STATUS_CONFIG[selectedConversation.status]?.color)}
                    >
                      {STATUS_CONFIG[selectedConversation.status]?.label}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Info</p>
                    
                    {selectedConversation.visitorPhone && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{selectedConversation.visitorPhone}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedConversation.visitorEmail && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{selectedConversation.visitorEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Details</p>
                    
                    {selectedConversation.eventType && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Event Type</p>
                          <p className="text-sm font-medium capitalize">{selectedConversation.eventType}</p>
                        </div>
                      </div>
                    )}

                    {selectedConversation.eventDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Preferred Date</p>
                          <p className="text-sm font-medium">{selectedConversation.eventDate}</p>
                        </div>
                      </div>
                    )}

                    {selectedConversation.eventLocation && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium">{selectedConversation.eventLocation}</p>
                        </div>
                      </div>
                    )}

                    {selectedConversation.budgetRange && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Budget Range</p>
                          <p className="text-sm font-medium">{formatBudget(selectedConversation.budgetRange)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Chat Started</p>
                        <p className="text-sm font-medium">
                          {format(new Date(selectedConversation.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedConversation.visitorPhone && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9"
                            onClick={() => window.open(`tel:${selectedConversation.visitorPhone}`)}
                          >
                            <Phone className="w-4 h-4 mr-1.5" />
                            Call
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                            onClick={() => window.open(`https://wa.me/${selectedConversation.visitorPhone?.replace(/\D/g, '')}`)}
                          >
                            <ExternalLink className="w-4 h-4 mr-1.5" />
                            WhatsApp
                          </Button>
                        </>
                      )}
                      {selectedConversation.visitorEmail && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9"
                          onClick={() => window.open(`mailto:${selectedConversation.visitorEmail}`)}
                        >
                          <Mail className="w-4 h-4 mr-1.5" />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
}
