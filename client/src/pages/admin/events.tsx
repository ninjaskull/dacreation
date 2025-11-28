import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, MapPin, Users, MoreHorizontal, Search, Edit, Trash2, Download, IndianRupee, Clock, CheckCircle, PartyPopper } from "lucide-react";
import type { Event, Client } from "@shared/schema";

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

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

export default function EventsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events", { search: searchQuery, status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
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
      toast({ title: "Event deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
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
      notes: formData.get("notes") as string || null,
      description: formData.get("description") as string || null,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "planning": return "bg-blue-500";
      case "in_progress": return "bg-purple-500";
      case "completed": return "bg-gray-500";
      case "cancelled": return "bg-red-500";
      case "postponed": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500">Paid</Badge>;
      case "partial": return <Badge className="bg-amber-500">Partial</Badge>;
      case "pending": return <Badge className="bg-red-500">Pending</Badge>;
      case "overdue": return <Badge className="bg-red-700">Overdue</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const openEditDialog = (event: EventWithDetails) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

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
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="social">Social Event</SelectItem>
                          <SelectItem value="destination">Destination</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
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
                      <Input id="venue" name="venue" defaultValue={editingEvent?.venue || ""} data-testid="input-event-venue" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestCount">Guest Count</Label>
                      <Input id="guestCount" name="guestCount" type="number" defaultValue={editingEvent?.guestCount || ""} data-testid="input-event-guests" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input id="budget" name="budget" type="number" defaultValue={editingEvent?.budget || ""} data-testid="input-event-budget" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractAmount">Contract Amount (₹)</Label>
                      <Input id="contractAmount" name="contractAmount" type="number" defaultValue={editingEvent?.contractAmount || ""} data-testid="input-event-contract" />
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
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="venueAddress">Venue Address</Label>
                      <Input id="venueAddress" name="venueAddress" defaultValue={editingEvent?.venueAddress || ""} data-testid="input-venue-address" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={editingEvent?.description || ""} rows={2} data-testid="textarea-event-description" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Internal Notes</Label>
                      <Textarea id="notes" name="notes" defaultValue={editingEvent?.notes || ""} rows={2} data-testid="textarea-event-notes" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-event">
                      {editingEvent ? "Update Event" : "Create Event"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PartyPopper className="w-4 h-4" />
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-events">{stats?.total || 0}</div>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed-events">{stats?.completed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-500" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-payments">
                {formatCurrency(stats?.pendingPayments || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
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
              <div className="flex gap-2">
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
                  </SelectContent>
                </Select>
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
                <p className="text-muted-foreground mb-4">Get started by adding your first event</p>
                <Button onClick={openNewDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{event.name}</span>
                          {event.client && (
                            <p className="text-sm text-muted-foreground">{event.client.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{event.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatDate(event.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {event.venue}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.guestCount && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            {event.guestCount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {event.contractAmount ? formatCurrency(event.contractAmount) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(event.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-event-menu-${event.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(event)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
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
    </AdminLayout>
  );
}
