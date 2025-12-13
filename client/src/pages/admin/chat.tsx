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
import { Card, CardContent } from "@/components/ui/card";
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
  Smile,
  Wifi,
  WifiOff,
  User,
  Clock,
  X,
  Headphones,
  MapPin,
  IndianRupee,
  ExternalLink,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  MessageCircle,
  Users,
  CheckCheck,
  Check,
  Bell,
  BellRing,
  Radio,
  RefreshCw,
} from "lucide-react";

const QUICK_REPLIES = [
  { label: "Greeting", text: "Hi! Thank you for reaching out. How can I help you today?" },
  { label: "Pricing", text: "Our event packages start from ₹5 Lakhs. Would you like me to share detailed pricing based on your requirements?" },
  { label: "Availability", text: "Let me check our availability for your preferred date. Could you please confirm the date you have in mind?" },
  { label: "Callback", text: "I'd be happy to have our event specialist call you. What's the best time to reach you?" },
  { label: "Follow-up", text: "Is there anything else I can help you with today?" },
  { label: "Thanks", text: "Thank you for choosing Da Creation! We look forward to making your event memorable." },
];
import { format, formatDistanceToNow, isToday, isYesterday, differenceInMinutes } from "date-fns";
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string; borderColor: string; icon: any; urgent?: boolean }> = {
  live_agent: { label: "Live Agent", color: "text-red-700", bgColor: "bg-red-50", dotColor: "bg-red-500", borderColor: "border-red-200", icon: Headphones, urgent: true },
  active: { label: "Active", color: "text-emerald-700", bgColor: "bg-emerald-50", dotColor: "bg-emerald-500", borderColor: "border-emerald-200", icon: Radio },
  waiting: { label: "Waiting", color: "text-amber-700", bgColor: "bg-amber-50", dotColor: "bg-amber-500", borderColor: "border-amber-200", icon: Clock },
  resolved: { label: "Resolved", color: "text-blue-700", bgColor: "bg-blue-50", dotColor: "bg-blue-500", borderColor: "border-blue-200", icon: CheckCircle2 },
  archived: { label: "Archived", color: "text-slate-600", bgColor: "bg-slate-50", dotColor: "bg-slate-400", borderColor: "border-slate-200", icon: Archive },
};

const EVENT_TYPE_CONFIG: Record<string, { color: string; bgColor: string }> = {
  wedding: { color: "text-pink-700", bgColor: "bg-pink-50" },
  corporate: { color: "text-blue-700", bgColor: "bg-blue-50" },
  social: { color: "text-purple-700", bgColor: "bg-purple-50" },
  destination: { color: "text-teal-700", bgColor: "bg-teal-50" },
  birthday: { color: "text-orange-700", bgColor: "bg-orange-50" },
  anniversary: { color: "text-rose-700", bgColor: "bg-rose-50" },
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

function getOnlineStatus(lastMessageAt: string | null): { isOnline: boolean; label: string; color: string } {
  if (!lastMessageAt) {
    return { isOnline: false, label: "Offline", color: "text-slate-400" };
  }
  const minutesAgo = differenceInMinutes(new Date(), new Date(lastMessageAt));
  if (minutesAgo <= 2) {
    return { isOnline: true, label: "Online now", color: "text-emerald-600" };
  }
  if (minutesAgo <= 5) {
    return { isOnline: true, label: "Active", color: "text-emerald-500" };
  }
  if (minutesAgo <= 15) {
    return { isOnline: false, label: "Away", color: "text-amber-500" };
  }
  if (minutesAgo <= 60) {
    return { isOnline: false, label: `${minutesAgo}m ago`, color: "text-slate-500" };
  }
  return { isOnline: false, label: "Offline", color: "text-slate-400" };
}

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
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
          title: "Live Agent Request!",
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

  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations", filterStatus, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (search) params.append("search", search);
      const response = await fetch(`/api/conversations${params.toString() ? `?${params}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    },
    refetchInterval: 10000,
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["conversationStats"],
    queryFn: async () => {
      const response = await fetch("/api/conversations/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<ConversationStats>;
    },
    refetchInterval: 10000,
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
    refetchInterval: 5000,
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
      if (selectedConversation) {
        const updateData: { status?: string; lastMessageAt: string } = { 
          lastMessageAt: new Date().toISOString() 
        };
        if (selectedConversation.status !== "active") {
          updateData.status = "active";
        }
        updateConversationMutation.mutate({
          id: selectedConversation.id,
          data: updateData,
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
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversationStats"] });
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

  const handleRefresh = () => {
    refetchConversations();
    refetchStats();
    toast({ title: "Refreshed", description: "Conversations updated" });
  };

  const messageGroups = groupMessagesByDate(messages);
  const isTyping = selectedConversation && typingUsers.has(selectedConversation.id);
  const unreadConversations = conversations.filter(c => (c.unreadCount || 0) > 0);
  const liveAgentRequests = conversations.filter(c => c.status === 'live_agent');

  return (
    <AdminLayout title="Live Chat" description="Real-time customer support">
      <TooltipProvider>
        <div className="h-full">
          <div className="h-[calc(100vh-140px)] flex bg-background rounded-xl border shadow-sm overflow-hidden">
            <div className="w-96 border-r flex flex-col bg-muted/30">
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-lg">Conversations</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                          isConnected 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-red-100 text-red-700"
                        )}>
                          {isConnected ? (
                            <>
                              <Wifi className="w-3 h-3" />
                              Live
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-3 h-3" />
                              Offline
                            </>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isConnected ? "Connected to real-time updates" : "Reconnecting..."}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={handleRefresh}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Refresh</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                        >
                          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{soundEnabled ? "Mute notifications" : "Enable notifications"}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, phone, email..." 
                    className="pl-9 h-10 bg-muted/50" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-conversations"
                  />
                </div>

                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {[
                    { key: "all", label: "All", count: stats?.total, icon: MessageSquare },
                    { key: "waiting", label: "Waiting", count: stats?.waiting, icon: Clock },
                    { key: "resolved", label: "Resolved", count: stats?.resolved, icon: CheckCircle2 },
                    { key: "archived", label: "Archived", count: stats?.archived, icon: Archive },
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={filterStatus === filter.key ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setFilterStatus(filter.key)}
                      className={cn(
                        "h-8 text-xs px-3",
                        filterStatus === filter.key && "font-medium"
                      )}
                      data-testid={`filter-${filter.key}`}
                    >
                      <filter.icon className="w-3.5 h-3.5 mr-1.5" />
                      {filter.label}
                      {filter.count !== undefined && filter.count > 0 && (
                        <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                          {filter.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {conversationsLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No conversations</p>
                      <p className="text-xs">New chats will appear here</p>
                    </div>
                  ) : (
                    conversations.map((conversation) => {
                      const statusConfig = STATUS_CONFIG[conversation.status] || STATUS_CONFIG.active;
                      const isSelected = selectedConversation?.id === conversation.id;
                      const hasUnread = (conversation.unreadCount || 0) > 0;
                      const onlineStatus = getOnlineStatus(conversation.lastMessageAt);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={cn(
                            "p-3 rounded-xl cursor-pointer transition-all mb-1.5 border",
                            isSelected 
                              ? "bg-primary/5 border-primary/30 shadow-sm" 
                              : hasUnread
                              ? "bg-amber-50/50 border-amber-200 hover:bg-amber-50"
                              : "border-transparent hover:bg-muted/80 hover:border-muted",
                            conversation.status === 'live_agent' && !isSelected && "bg-red-50/50 border-red-200"
                          )}
                          data-testid={`conversation-${conversation.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className={cn(
                                "w-11 h-11 border-2",
                                hasUnread ? "border-amber-400" : "border-muted"
                              )}>
                                <AvatarFallback className={cn(
                                  "font-medium text-sm",
                                  hasUnread 
                                    ? "bg-amber-100 text-amber-700" 
                                    : "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                                )}>
                                  {getInitials(conversation.visitorName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background",
                                onlineStatus.isOnline ? "bg-emerald-500" : "bg-slate-300"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn(
                                  "text-sm truncate",
                                  hasUnread ? "font-bold text-foreground" : "font-medium"
                                )}>
                                  {conversation.visitorName || `Visitor ${conversation.visitorId.slice(-6)}`}
                                </p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {hasUnread && (
                                    <Badge 
                                      className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-500"
                                    >
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                  {conversation.lastMessageAt && (
                                    <span className={cn(
                                      "text-[11px]",
                                      hasUnread ? "text-amber-600 font-medium" : "text-muted-foreground"
                                    )}>
                                      {formatMessageTime(conversation.lastMessageAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1.5 mt-1">
                                {conversation.status === 'live_agent' ? (
                                  <Badge 
                                    variant="destructive" 
                                    className="text-[10px] px-1.5 py-0 h-5 font-semibold animate-pulse"
                                  >
                                    <Headphones className="w-3 h-3 mr-1" />
                                    LIVE AGENT
                                  </Badge>
                                ) : (
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[10px] px-1.5 py-0 h-5 font-medium",
                                      statusConfig.bgColor,
                                      statusConfig.color,
                                      statusConfig.borderColor
                                    )}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                )}
                                {conversation.eventType && (
                                  <Badge 
                                    variant="secondary" 
                                    className={cn(
                                      "text-[10px] px-1.5 py-0 h-5 font-normal capitalize",
                                      EVENT_TYPE_CONFIG[conversation.eventType]?.bgColor || "bg-slate-100",
                                      EVENT_TYPE_CONFIG[conversation.eventType]?.color || "text-slate-700"
                                    )}
                                  >
                                    {conversation.eventType}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={cn("text-[11px] flex items-center gap-1", onlineStatus.color)}>
                                  <Circle className={cn(
                                    "w-1.5 h-1.5 fill-current",
                                    onlineStatus.isOnline && "animate-pulse"
                                  )} />
                                  {onlineStatus.label}
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {conversation.visitorPhone || conversation.visitorEmail || "No contact info"}
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
                      <div className="relative">
                        <Avatar className="w-10 h-10 border">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                            {getInitials(selectedConversation.visitorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                          getOnlineStatus(selectedConversation.lastMessageAt).isOnline ? "bg-emerald-500" : "bg-slate-300"
                        )} />
                      </div>
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
                              className={cn(
                                "text-[10px] h-5",
                                STATUS_CONFIG[selectedConversation.status]?.bgColor,
                                STATUS_CONFIG[selectedConversation.status]?.color
                              )}
                            >
                              {STATUS_CONFIG[selectedConversation.status]?.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                          <span className={cn(
                            "flex items-center gap-1",
                            getOnlineStatus(selectedConversation.lastMessageAt).color
                          )}>
                            <Circle className={cn(
                              "w-1.5 h-1.5 fill-current",
                              getOnlineStatus(selectedConversation.lastMessageAt).isOnline && "animate-pulse"
                            )} />
                            {getOnlineStatus(selectedConversation.lastMessageAt).label}
                          </span>
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
                            <Radio className="w-4 h-4 mr-2 text-emerald-500" />
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant={showDetails ? "secondary" : "ghost"}
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setShowDetails(!showDetails)}
                          >
                            <User className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Contact Details</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 bg-gradient-to-b from-muted/20 to-muted/5">
                    <div className="p-4 space-y-6 min-h-full">
                      {Array.from(messageGroups.entries()).map(([dateKey, dateMessages]) => (
                        <div key={dateKey}>
                          <div className="flex items-center justify-center mb-4">
                            <div className="bg-muted/80 px-4 py-1.5 rounded-full shadow-sm">
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
                                    <Avatar className="w-8 h-8 mt-1 border">
                                      <AvatarFallback className={cn(
                                        "text-xs",
                                        isSystem ? "bg-slate-200" : "bg-primary/10 text-primary"
                                      )}>
                                        {isSystem ? "AI" : getInitials(message.senderName)}
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
                                        {isSystem ? "Bot Assistant" : message.senderName || "Visitor"}
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
                                    <div className={cn(
                                      "flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                      isAdmin ? "justify-end mr-1" : "ml-1"
                                    )}>
                                      <span className="text-[10px] text-muted-foreground">
                                        {format(new Date(message.createdAt), "h:mm a")}
                                      </span>
                                      {isAdmin && (
                                        <span className="text-muted-foreground">
                                          {message.isRead ? (
                                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                          ) : (
                                            <Check className="w-3.5 h-3.5" />
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex gap-2 items-center">
                          <Avatar className="w-8 h-8 border">
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
                          <span className="text-xs text-muted-foreground">typing...</span>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="border-t bg-background">
                    {showQuickReplies && (
                      <div className="p-3 border-b bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            Quick Replies
                          </span>
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
                              className="h-8 text-xs"
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant={showQuickReplies ? "secondary" : "ghost"} 
                              size="icon" 
                              className="h-11 w-11 rounded-xl shrink-0"
                              onClick={() => setShowQuickReplies(!showQuickReplies)}
                            >
                              <Zap className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Quick Replies</TooltipContent>
                        </Tooltip>
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
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Smile className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          size="icon"
                          disabled={!messageInput.trim() || isSending}
                          className="h-11 w-11 rounded-xl shrink-0"
                          data-testid="button-send-message"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-muted/20 to-muted/5">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <MessageCircle className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose from your existing conversations on the left or wait for new visitors to start chatting
                    </p>
                    {liveAgentRequests.length > 0 && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center justify-center gap-2 text-red-600 font-medium mb-2">
                          <Headphones className="w-5 h-5 animate-pulse" />
                          <span>{liveAgentRequests.length} Live Agent Request{liveAgentRequests.length > 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-xs text-red-500">Visitors are waiting for human assistance</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedConversation && showDetails && (
              <div className="w-80 border-l bg-background flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Contact Details</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetails(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    {selectedConversation.status === 'live_agent' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-1">
                          <Headphones className="w-5 h-5 animate-pulse" />
                          <span>Live Agent Requested</span>
                        </div>
                        {selectedConversation.liveAgentRequestedAt && (
                          <p className="text-xs text-red-500">
                            Requested {formatDistanceToNow(new Date(selectedConversation.liveAgentRequestedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                        <Avatar className="w-20 h-20 border-2">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl font-medium">
                            {getInitials(selectedConversation.visitorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-background",
                          getOnlineStatus(selectedConversation.lastMessageAt).isOnline ? "bg-emerald-500" : "bg-slate-300"
                        )} />
                      </div>
                      <h4 className="font-semibold text-lg mt-3">
                        {selectedConversation.visitorName || `Visitor ${selectedConversation.visitorId.slice(-6)}`}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn(
                          "text-sm flex items-center gap-1",
                          getOnlineStatus(selectedConversation.lastMessageAt).color
                        )}>
                          <Circle className={cn(
                            "w-2 h-2 fill-current",
                            getOnlineStatus(selectedConversation.lastMessageAt).isOnline && "animate-pulse"
                          )} />
                          {getOnlineStatus(selectedConversation.lastMessageAt).label}
                        </span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "mt-2",
                          STATUS_CONFIG[selectedConversation.status]?.bgColor, 
                          STATUS_CONFIG[selectedConversation.status]?.color
                        )}
                      >
                        {STATUS_CONFIG[selectedConversation.status]?.label}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</p>
                      
                      {selectedConversation.visitorPhone && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium">{selectedConversation.visitorPhone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedConversation.visitorEmail && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium break-all">{selectedConversation.visitorEmail}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Details</p>
                      
                      {selectedConversation.eventType && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Event Type</p>
                            <p className="text-sm font-medium capitalize">{selectedConversation.eventType}</p>
                          </div>
                        </div>
                      )}

                      {selectedConversation.eventDate && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Preferred Date</p>
                            <p className="text-sm font-medium">{selectedConversation.eventDate}</p>
                          </div>
                        </div>
                      )}

                      {selectedConversation.eventLocation && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium">{selectedConversation.eventLocation}</p>
                          </div>
                        </div>
                      )}

                      {selectedConversation.budgetRange && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                            <IndianRupee className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Budget Range</p>
                            <p className="text-sm font-medium">{formatBudget(selectedConversation.budgetRange)}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
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

                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedConversation.visitorPhone && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 justify-start"
                              onClick={() => window.open(`tel:${selectedConversation.visitorPhone}`)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call {selectedConversation.visitorPhone}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 justify-start bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                              onClick={() => window.open(`https://wa.me/${selectedConversation.visitorPhone?.replace(/\D/g, '')}`)}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open in WhatsApp
                            </Button>
                          </>
                        )}
                        {selectedConversation.visitorEmail && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 justify-start"
                            onClick={() => window.open(`mailto:${selectedConversation.visitorEmail}`)}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
}
