import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Search,
  Send,
  User,
  Clock,
  CheckCircle2,
  Archive,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Circle,
  X,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  eventType: string | null;
  status: string;
  assignedTo: string | null;
  lastMessageAt: string | null;
  createdAt: string;
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
  resolved: number;
  archived: number;
  unreadMessages: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  active: { label: "Active", color: "text-green-600", bgColor: "bg-green-500" },
  waiting: { label: "Waiting", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  resolved: { label: "Resolved", color: "text-blue-600", bgColor: "bg-blue-500" },
  archived: { label: "Archived", color: "text-gray-600", bgColor: "bg-gray-500" },
};

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations", filterStatus, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (search) params.append("search", search);
      const response = await fetch(`/api/conversations${params.toString() ? `?${params}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    },
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ["conversationStats"],
    queryFn: async () => {
      const response = await fetch("/api/conversations/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<ConversationStats>;
    },
    refetchInterval: 10000,
  });

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["chatMessages", selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<ChatMessage[]>;
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000,
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
      refetchMessages();
      if (selectedConversation && selectedConversation.status !== "active") {
        updateConversationMutation.mutate({
          id: selectedConversation.id,
          data: { status: "active", lastMessageAt: new Date().toISOString() },
        });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetch(`/api/conversations/${selectedConversation.id}/mark-read`, { method: "POST" });
    }
  }, [selectedConversation?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;
    
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

  const handleStatusChange = (conversationId: string, newStatus: string) => {
    updateConversationMutation.mutate({
      id: conversationId,
      data: { status: newStatus },
    });
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const filteredConversations = conversations || [];

  return (
    <AdminLayout title="Customer Chat" description="Respond to customer conversations">
      <div className="h-[calc(100vh-180px)] flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setFilterStatus("all")} data-testid="card-total-chats">
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-green-500 transition-colors" onClick={() => setFilterStatus("active")} data-testid="card-active-chats">
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-green-600">
                <Circle className="w-3.5 h-3.5 fill-current" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-green-600">{stats?.active || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-yellow-500 transition-colors" onClick={() => setFilterStatus("waiting")} data-testid="card-waiting-chats">
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-yellow-600">
                <Clock className="w-3.5 h-3.5" />
                Waiting
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-yellow-600">{stats?.waiting || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setFilterStatus("resolved")} data-testid="card-resolved-chats">
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-blue-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-blue-600">{stats?.resolved || 0}</div>
            </CardContent>
          </Card>
          <Card data-testid="card-unread-messages">
            <CardHeader className="pb-2 px-4 py-3">
              <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-red-600">
                <MessageSquare className="w-3.5 h-3.5" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-red-600">{stats?.unreadMessages || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          <Card className="col-span-4 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search conversations..." 
                    className="pl-9 h-9" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-conversations" 
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => refetchConversations()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="px-4 pb-4 space-y-2">
                {conversationsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No conversations found</div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const statusConfig = STATUS_CONFIG[conversation.status] || STATUS_CONFIG.active;
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected 
                            ? "bg-primary/5 border-primary" 
                            : "hover:bg-muted/50 border-transparent"
                        )}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {conversation.visitorName || `Visitor ${conversation.visitorId.slice(-6)}`}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.eventType ? `${conversation.eventType} inquiry` : "General inquiry"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <Badge variant="outline" className={cn("text-[10px] px-1.5", statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                            {conversation.lastMessageAt && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="col-span-8 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3 flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {selectedConversation.visitorName || `Visitor ${selectedConversation.visitorId.slice(-6)}`}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {selectedConversation.visitorPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {selectedConversation.visitorPhone}
                            </span>
                          )}
                          {selectedConversation.visitorEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {selectedConversation.visitorEmail}
                            </span>
                          )}
                          {selectedConversation.eventType && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {selectedConversation.eventType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedConversation.status !== "resolved" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(selectedConversation.id, "resolved")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                      {selectedConversation.status !== "archived" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleStatusChange(selectedConversation.id, "archived")}
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.senderType === "admin" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            message.senderType === "admin"
                              ? "bg-primary text-primary-foreground"
                              : message.senderType === "system"
                              ? "bg-muted border"
                              : "bg-white border shadow-sm"
                          )}
                        >
                          {message.senderType !== "admin" && (
                            <p className="text-xs font-medium mb-1 text-muted-foreground">
                              {message.senderName || (message.senderType === "system" ? "Bot" : "Visitor")}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={cn(
                            "text-[10px] mt-1",
                            message.senderType === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {format(new Date(message.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      data-testid="input-chat-message"
                    />
                    <Button type="submit" disabled={!messageInput.trim() || isSending} data-testid="button-send-message">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
