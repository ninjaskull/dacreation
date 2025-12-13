import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Calendar, MapPin, Users, MoreHorizontal, Search, Edit, Trash2, Download, 
  IndianRupee, Clock, CheckCircle, PartyPopper, Eye, CreditCard, FileText, 
  Building2, Phone, Mail, TrendingUp, AlertTriangle, X, ChevronRight,
  CalendarDays, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, History,
  PlayCircle, PauseCircle, XCircle, RotateCcw, Check
} from "lucide-react";
import type { Event, Client, Vendor } from "@shared/schema";

interface EventWithDetails extends Event {
  client?: { id: string; name: string; email: string } | null;
  assignee?: { id: string; name: string | null; username: string } | null;
}

interface EventStats {
  total: number;
  upcoming: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
  pendingPayments: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

interface TimelineEntry {
  id?: string;
  type: string;
  date: string;
  description: string;
  amount?: number;
  method?: string;
  reference?: string;
  notes?: string;
  oldStatus?: string;
  newStatus?: string;
  createdBy?: string;
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatFullCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDaysUntilEvent = (date: string | Date) => {
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "wedding": return "💒";
    case "corporate": return "🏢";
    case "social": return "🎉";
    case "destination": return "✈️";
    case "birthday": return "🎂";
    case "anniversary": return "💕";
    default: return "🎊";
  }
};

const getEventTypeLabel = (type: string) => {
  switch (type) {
    case "wedding": return "Wedding";
    case "corporate": return "Corporate Event";
    case "social": return "Social Event";
    case "destination": return "Destination Event";
    case "birthday": return "Birthday Party";
    case "anniversary": return "Anniversary";
    default: return "Other";
  }
};

export default function EventsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events", { search: searchQuery, status: statusFilter, type: typeFilter, paymentStatus: paymentFilter, clientId: clientFilter, dateFrom: dateFromFilter, dateTo: dateToFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (paymentFilter !== "all") params.append("paymentStatus", paymentFilter);
      if (clientFilter !== "all") params.append("clientId", clientFilter);
      if (dateFromFilter) params.append("dateFrom", dateFromFilter);
      if (dateToFilter) params.append("dateTo", dateToFilter);
      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const { data: stats } = useQuery<EventStats>({
    queryKey: ["/api/events/stats"],
    queryFn: async () => {
      const response = await fetch("/api/events/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    queryFn: async () => {
      const response = await fetch("/api/vendors");
      if (!response.ok) throw new Error("Failed to fetch vendors");
      return response.json();
    },
  });

  const { data: teamMembers = [] } = useQuery<{ id: string; name: string | null; username: string }[]>({
    queryKey: ["/api/team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats"] });
      setIsDialogOpen(false);
      toast({ title: "Event created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats"] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      toast({ title: "Event updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats"] });
      setSelectedEvent(null);
      setViewMode("list");
      toast({ title: "Event deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/events/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to record payment");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats"] });
      setIsPaymentDialogOpen(false);
      setSelectedEvent(data);
      toast({ title: "Payment recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "destructive" });
    },
  });

  const timelineMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/events/${id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add timeline entry");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsTimelineDialogOpen(false);
      setSelectedEvent(data);
      toast({ title: "Timeline entry added" });
    },
    onError: () => {
      toast({ title: "Failed to add timeline entry", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/events/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/stats"] });
      setSelectedEvent(data);
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleExport = async () => {
    window.open("/api/events/export?format=csv", "_blank");
    toast({ title: "Export started" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      date: formData.get("date") as string,
      endDate: formData.get("endDate") as string || null,
      venue: formData.get("venue") as string || null,
      venueAddress: formData.get("venueAddress") as string || null,
      guestCount: parseInt(formData.get("guestCount") as string) || null,
      budget: parseInt(formData.get("budget") as string) || null,
      contractAmount: parseInt(formData.get("contractAmount") as string) || null,
      status: formData.get("status") as string,
      paymentStatus: formData.get("paymentStatus") as string,
      clientId: formData.get("clientId") as string || null,
      assignedTo: formData.get("assignedTo") as string || null,
      notes: formData.get("notes") as string || null,
      description: formData.get("description") as string || null,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      amount: parseInt(formData.get("amount") as string),
      method: formData.get("method") as string,
      reference: formData.get("reference") as string || null,
      notes: formData.get("notes") as string || null,
    };
    
    paymentMutation.mutate({ id: selectedEvent.id, data });
  };

  const handleTimelineSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string || new Date().toISOString(),
    };
    
    timelineMutation.mutate({ id: selectedEvent.id, data });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500 hover:bg-green-600";
      case "planning": return "bg-blue-500 hover:bg-blue-600";
      case "in_progress": return "bg-purple-500 hover:bg-purple-600";
      case "completed": return "bg-gray-500 hover:bg-gray-600";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      case "postponed": return "bg-amber-500 hover:bg-amber-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <Check className="w-3 h-3" />;
      case "planning": return <Clock className="w-3 h-3" />;
      case "in_progress": return <PlayCircle className="w-3 h-3" />;
      case "completed": return <CheckCircle className="w-3 h-3" />;
      case "cancelled": return <XCircle className="w-3 h-3" />;
      case "postponed": return <PauseCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case "partial": return <Badge className="bg-amber-500 hover:bg-amber-600">Partial</Badge>;
      case "pending": return <Badge className="bg-red-500 hover:bg-red-600">Pending</Badge>;
      case "overdue": return <Badge className="bg-red-700 hover:bg-red-800">Overdue</Badge>;
      case "refunded": return <Badge className="bg-gray-500 hover:bg-gray-600">Refunded</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPaymentProgress = (event: EventWithDetails) => {
    if (!event.contractAmount || event.contractAmount === 0) return 0;
    return Math.min(100, ((event.paidAmount || 0) / event.contractAmount) * 100);
  };

  const getBalanceDue = (event: EventWithDetails) => {
    return (event.contractAmount || 0) - (event.paidAmount || 0);
  };

  const openEditDialog = (event: EventWithDetails) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const openEventDetail = (event: EventWithDetails) => {
    setSelectedEvent(event);
    setViewMode("detail");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPaymentFilter("all");
    setClientFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all" || 
    paymentFilter !== "all" || clientFilter !== "all" || dateFromFilter || dateToFilter;

  const timeline = selectedEvent?.timeline as TimelineEntry[] | null;

  if (viewMode === "detail" && selectedEvent) {
    return (
      <AdminLayout title="Event Details" description="View and manage event information">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => { setViewMode("list"); setSelectedEvent(null); }} data-testid="button-back-to-list">
                <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                Back to Events
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <span>{getEventTypeIcon(selectedEvent.type)}</span>
                  {selectedEvent.name}
                </h2>
                <p className="text-muted-foreground">{getEventTypeLabel(selectedEvent.type)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openEditDialog(selectedEvent)} data-testid="button-edit-event-detail">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button data-testid="button-quick-status">
                    {getStatusIcon(selectedEvent.status)}
                    <span className="ml-2 capitalize">{selectedEvent.status.replace('_', ' ')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {["planning", "confirmed", "in_progress", "completed", "postponed", "cancelled"].map((status) => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => statusMutation.mutate({ id: selectedEvent.id, status })}
                      disabled={selectedEvent.status === status}
                    >
                      {getStatusIcon(status)}
                      <span className="ml-2 capitalize">{status.replace('_', ' ')}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  Event Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold" data-testid="text-event-date">{formatDate(selectedEvent.date)}</div>
                {selectedEvent.endDate && (
                  <p className="text-sm text-muted-foreground">to {formatDate(selectedEvent.endDate)}</p>
                )}
                {getDaysUntilEvent(selectedEvent.date) >= 0 && selectedEvent.status !== "completed" && selectedEvent.status !== "cancelled" && (
                  <Badge variant="outline" className="mt-2">
                    {getDaysUntilEvent(selectedEvent.date) === 0 ? "Today!" : `${getDaysUntilEvent(selectedEvent.date)} days away`}
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Contract Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold" data-testid="text-contract-amount">
                  {selectedEvent.contractAmount ? formatFullCurrency(selectedEvent.contractAmount) : "Not set"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Budget: {selectedEvent.budget ? formatFullCurrency(selectedEvent.budget) : "Not set"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-500" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" data-testid="text-paid-amount">
                      {formatFullCurrency(selectedEvent.paidAmount || 0)}
                    </span>
                    {getPaymentStatusBadge(selectedEvent.paymentStatus)}
                  </div>
                  <Progress value={getPaymentProgress(selectedEvent)} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Balance: {formatFullCurrency(getBalanceDue(selectedEvent))}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Guest Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold" data-testid="text-guest-count">
                  {selectedEvent.guestCount || "Not specified"}
                </div>
                {selectedEvent.venue && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedEvent.venue}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">Event Type</Label>
                        <p className="font-medium">{getEventTypeLabel(selectedEvent.type)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Status</Label>
                        <div>
                          <Badge className={getStatusColor(selectedEvent.status)}>
                            {selectedEvent.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Event Date</Label>
                        <p className="font-medium">{formatDate(selectedEvent.date)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">End Date</Label>
                        <p className="font-medium">{selectedEvent.endDate ? formatDate(selectedEvent.endDate) : "Same day"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Guest Count</Label>
                        <p className="font-medium">{selectedEvent.guestCount || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Assigned To</Label>
                        <p className="font-medium">{selectedEvent.assignee?.name || selectedEvent.assignee?.username || "Unassigned"}</p>
                      </div>
                    </div>
                    {selectedEvent.description && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Description</Label>
                        <p className="mt-1">{selectedEvent.description}</p>
                      </div>
                    )}
                    {selectedEvent.notes && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Internal Notes</Label>
                        <p className="mt-1 text-sm bg-muted p-3 rounded-md">{selectedEvent.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Venue & Client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Venue</Label>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {selectedEvent.venue || "Not specified"}
                      </p>
                      {selectedEvent.venueAddress && (
                        <p className="text-sm text-muted-foreground mt-1 ml-6">{selectedEvent.venueAddress}</p>
                      )}
                    </div>
                    <Separator />
                    {selectedEvent.client ? (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Client Details</Label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{selectedEvent.client.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {selectedEvent.client.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-muted-foreground text-xs">Client</Label>
                        <p className="text-muted-foreground">No client assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Payment Summary</CardTitle>
                    <CardDescription>Track payments and balance for this event</CardDescription>
                  </div>
                  <Button onClick={() => setIsPaymentDialogOpen(true)} data-testid="button-record-payment">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Contract Amount</p>
                      <p className="text-2xl font-bold">{formatFullCurrency(selectedEvent.contractAmount || 0)}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400 mb-1">Amount Received</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
                        {formatFullCurrency(selectedEvent.paidAmount || 0)}
                        <ArrowUpRight className="w-5 h-5" />
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${getBalanceDue(selectedEvent) > 0 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-gray-50 dark:bg-gray-950/30'}`}>
                      <p className={`text-sm mb-1 ${getBalanceDue(selectedEvent) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>Balance Due</p>
                      <p className={`text-2xl font-bold flex items-center gap-2 ${getBalanceDue(selectedEvent) > 0 ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                        {formatFullCurrency(getBalanceDue(selectedEvent))}
                        {getBalanceDue(selectedEvent) > 0 && <ArrowDownRight className="w-5 h-5" />}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Progress</span>
                      <span>{Math.round(getPaymentProgress(selectedEvent))}%</span>
                    </div>
                    <Progress value={getPaymentProgress(selectedEvent)} className="h-3" />
                  </div>

                  {timeline && timeline.filter(e => e.type === 'payment').length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-4">Payment History</h4>
                      <div className="space-y-3">
                        {timeline.filter(e => e.type === 'payment').map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{formatFullCurrency(entry.amount || 0)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {entry.method && `via ${entry.method}`}
                                  {entry.reference && ` • Ref: ${entry.reference}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{formatDateTime(entry.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Event Timeline</CardTitle>
                    <CardDescription>Track milestones, updates, and activities</CardDescription>
                  </div>
                  <Button onClick={() => setIsTimelineDialogOpen(true)} data-testid="button-add-timeline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </CardHeader>
                <CardContent>
                  {timeline && timeline.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-6">
                          {[...timeline].reverse().map((entry, idx) => (
                            <div key={idx} className="relative pl-10">
                              <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                entry.type === 'payment' ? 'bg-green-100 dark:bg-green-950 text-green-600' :
                                entry.type === 'status_change' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                                entry.type === 'milestone' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' :
                                'bg-gray-100 dark:bg-gray-800 text-gray-600'
                              }`}>
                                {entry.type === 'payment' ? <IndianRupee className="w-4 h-4" /> :
                                 entry.type === 'status_change' ? <RotateCcw className="w-4 h-4" /> :
                                 entry.type === 'milestone' ? <CheckCircle className="w-4 h-4" /> :
                                 <History className="w-4 h-4" />}
                              </div>
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium capitalize">{entry.type.replace('_', ' ')}</span>
                                  <span className="text-sm text-muted-foreground">{formatDateTime(entry.date)}</span>
                                </div>
                                <p>{entry.description}</p>
                                {entry.notes && (
                                  <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No timeline entries yet</h3>
                      <p className="text-muted-foreground mb-4">Start tracking milestones and activities</p>
                      <Button onClick={() => setIsTimelineDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Entry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Add a payment for {selectedEvent.name}. Current balance: {formatFullCurrency(getBalanceDue(selectedEvent))}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (₹) *</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  required 
                  min="1"
                  placeholder="Enter amount"
                  data-testid="input-payment-amount" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select name="method" defaultValue="bank_transfer">
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference / Transaction ID</Label>
                <Input id="reference" name="reference" placeholder="e.g., TXN123456" data-testid="input-payment-reference" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes" rows={2} data-testid="textarea-payment-notes" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={paymentMutation.isPending} data-testid="button-submit-payment">
                  {paymentMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Entry</DialogTitle>
              <DialogDescription>Add a milestone, note, or update to the event timeline</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTimelineSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Entry Type *</Label>
                <Select name="type" defaultValue="milestone">
                  <SelectTrigger data-testid="select-timeline-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task Completed</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="vendor_update">Vendor Update</SelectItem>
                    <SelectItem value="client_communication">Client Communication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  placeholder="Describe the update or milestone" 
                  rows={3} 
                  data-testid="textarea-timeline-description" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="datetime-local" data-testid="input-timeline-date" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTimelineDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={timelineMutation.isPending} data-testid="button-submit-timeline">
                  {timelineMutation.isPending ? "Adding..." : "Add Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Events" description="Manage all your events and bookings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">All Events</h2>
            <p className="text-muted-foreground">View and manage upcoming and past events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-events">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog} data-testid="button-add-event">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name *</Label>
                      <Input id="name" name="name" defaultValue={editingEvent?.name || ""} required data-testid="input-event-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Event Type *</Label>
                      <Select name="type" defaultValue={editingEvent?.type || "wedding"}>
                        <SelectTrigger data-testid="select-event-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="social">Social Event</SelectItem>
                          <SelectItem value="destination">Destination Event</SelectItem>
                          <SelectItem value="birthday">Birthday Party</SelectItem>
                          <SelectItem value="anniversary">Anniversary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Event Date *</Label>
                      <Input 
                        id="date" 
                        name="date" 
                        type="date" 
                        defaultValue={editingEvent?.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ""} 
                        required 
                        data-testid="input-event-date" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate" 
                        name="endDate" 
                        type="date" 
                        defaultValue={editingEvent?.endDate ? new Date(editingEvent.endDate).toISOString().split('T')[0] : ""} 
                        data-testid="input-event-enddate" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input id="venue" name="venue" defaultValue={editingEvent?.venue || ""} placeholder="e.g., Grand Ballroom" data-testid="input-event-venue" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestCount">Guest Count</Label>
                      <Input id="guestCount" name="guestCount" type="number" defaultValue={editingEvent?.guestCount || ""} placeholder="Expected guests" data-testid="input-event-guests" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input id="budget" name="budget" type="number" defaultValue={editingEvent?.budget || ""} placeholder="Client budget" data-testid="input-event-budget" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractAmount">Contract Amount (₹)</Label>
                      <Input id="contractAmount" name="contractAmount" type="number" defaultValue={editingEvent?.contractAmount || ""} placeholder="Agreed amount" data-testid="input-event-contract" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingEvent?.status || "planning"}>
                        <SelectTrigger data-testid="select-event-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="postponed">Postponed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Payment Status</Label>
                      <Select name="paymentStatus" defaultValue={editingEvent?.paymentStatus || "pending"}>
                        <SelectTrigger data-testid="select-payment-status">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client</Label>
                      <Select name="clientId" defaultValue={editingEvent?.clientId || ""}>
                        <SelectTrigger data-testid="select-event-client">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No client</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Select name="assignedTo" defaultValue={editingEvent?.assignedTo || ""}>
                        <SelectTrigger data-testid="select-event-assigned">
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>{member.name || member.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="venueAddress">Venue Address</Label>
                      <Input id="venueAddress" name="venueAddress" defaultValue={editingEvent?.venueAddress || ""} placeholder="Full address" data-testid="input-venue-address" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={editingEvent?.description || ""} rows={2} placeholder="Event description" data-testid="textarea-event-description" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Internal Notes</Label>
                      <Textarea id="notes" name="notes" defaultValue={editingEvent?.notes || ""} rows={2} placeholder="Private notes for team" data-testid="textarea-event-notes" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-event">
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PartyPopper className="w-4 h-4" />
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-events">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-upcoming-events">{stats?.upcoming || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-revenue">{formatCurrency(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">From completed payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-payments">
                {formatCurrency(stats?.pendingPayments || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search events..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-events" 
                  />
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="filter-event-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]" data-testid="filter-event-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="destination">Destination</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-payment-status">
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-client">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-[140px]"
                    placeholder="From date"
                    data-testid="filter-date-from"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input 
                    type="date" 
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="w-[140px]"
                    placeholder="To date"
                    data-testid="filter-date-to"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters ? "Try adjusting your filters" : "Get started by adding your first event"}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                ) : (
                  <Button onClick={openNewDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow 
                      key={event.id} 
                      data-testid={`row-event-${event.id}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openEventDetail(event)}
                    >
                      <TableCell>
                        <div>
                          <span className="font-medium flex items-center gap-2">
                            <span>{getEventTypeIcon(event.type)}</span>
                            {event.name}
                          </span>
                          {event.venue && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {event.venue}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{getEventTypeLabel(event.type)}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {formatDate(event.date)}
                          </div>
                          {getDaysUntilEvent(event.date) >= 0 && event.status !== "completed" && event.status !== "cancelled" && (
                            <span className="text-xs text-muted-foreground">
                              {getDaysUntilEvent(event.date) === 0 ? "Today" : `${getDaysUntilEvent(event.date)} days`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.client ? (
                          <div>
                            <span className="font-medium">{event.client.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{event.contractAmount ? formatCurrency(event.contractAmount) : '-'}</span>
                          {event.contractAmount && event.paidAmount !== undefined && (
                            <div className="w-20 mt-1">
                              <Progress value={getPaymentProgress(event)} className="h-1" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {getPaymentStatusBadge(event.paymentStatus)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-event-menu-${event.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEventDetail(event)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(event)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedEvent(event); setIsPaymentDialogOpen(true); }}>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this event?")) {
                                  deleteMutation.mutate(event.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPaymentDialogOpen && !selectedEvent} onOpenChange={(open) => { if (!open) setIsPaymentDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Select an event first to record a payment</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
