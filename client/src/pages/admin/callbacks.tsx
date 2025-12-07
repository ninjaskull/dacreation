import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Search,
  Filter,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  PhoneMissed,
  Calendar,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

type CallbackRequest = {
  id: string;
  name: string;
  phone: string;
  eventType: string | null;
  preferredTime: string | null;
  source: string;
  status: string;
  priority: string;
  notes: string | null;
  assignedTo: string | null;
  calledAt: string | null;
  createdAt: string;
};

type CallbackStats = {
  total: number;
  pending: number;
  completed: number;
  missed: number;
  scheduled: number;
  todayCount: number;
};

const PAGE_SIZE = 15;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Calendar },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
  missed: { label: "Missed", color: "bg-red-500", icon: PhoneMissed },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: X },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-400" },
  normal: { label: "Normal", color: "bg-blue-400" },
  high: { label: "High", color: "bg-orange-500" },
  urgent: { label: "Urgent", color: "bg-red-600" },
};

const SOURCE_LABELS: Record<string, string> = {
  floating_cta: "Floating Button",
  contact_form: "Contact Form",
  website: "Website",
  phone: "Direct Call",
  referral: "Referral",
};

export default function CallbacksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedCallback, setSelectedCallback] = useState<CallbackRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [callbackToDelete, setCallbackToDelete] = useState<CallbackRequest | null>(null);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.append("status", filterStatus);
    if (filterPriority !== "all") params.append("priority", filterPriority);
    if (search) params.append("search", search);
    return params.toString();
  };

  const { data: callbacks, isLoading, refetch } = useQuery({
    queryKey: ["callbackRequests", filterStatus, filterPriority, search],
    queryFn: async () => {
      const queryStr = buildQueryParams();
      const response = await fetch(`/api/callback-requests${queryStr ? `?${queryStr}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch callback requests");
      return response.json() as Promise<CallbackRequest[]>;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["callbackStats"],
    queryFn: async () => {
      const response = await fetch("/api/callback-requests/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<CallbackStats>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update callback request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callbackRequests"] });
      queryClient.invalidateQueries({ queryKey: ["callbackStats"] });
      toast({ title: "Updated", description: "Callback request updated successfully" });
      setIsDetailOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update callback request", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete callback request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callbackRequests"] });
      queryClient.invalidateQueries({ queryKey: ["callbackStats"] });
      toast({ title: "Deleted", description: "Callback request deleted successfully" });
      setDeleteDialogOpen(false);
      setCallbackToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete callback request", variant: "destructive" });
    },
  });

  const handleDeleteClick = (callback: CallbackRequest) => {
    setCallbackToDelete(callback);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (callbackToDelete) {
      deleteMutation.mutate(callbackToDelete.id);
    }
  };

  const sortedCallbacks = useMemo(() => {
    if (!callbacks) return [];
    return [...callbacks].sort((a, b) => {
      let aVal: any = a[sortField as keyof CallbackRequest];
      let bVal: any = b[sortField as keyof CallbackRequest];
      
      if (sortField === "createdAt" || sortField === "calledAt") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [callbacks, sortField, sortDirection]);

  const paginatedCallbacks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedCallbacks.slice(start, start + PAGE_SIZE);
  }, [sortedCallbacks, currentPage]);

  const totalPages = Math.ceil((sortedCallbacks?.length || 0) / PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleOpenDetail = (callback: CallbackRequest) => {
    setSelectedCallback(callback);
    setEditNotes(callback.notes || "");
    setEditStatus(callback.status);
    setIsDetailOpen(true);
  };

  const handleSaveDetail = () => {
    if (!selectedCallback) return;
    
    const updates: any = {
      notes: editNotes,
      status: editStatus,
    };
    
    if (editStatus === "completed" && selectedCallback.status !== "completed") {
      updates.calledAt = new Date().toISOString();
    }
    
    updateMutation.mutate({ id: selectedCallback.id, data: updates });
  };

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "completed") {
      updates.calledAt = new Date().toISOString();
    }
    updateMutation.mutate({ id, data: updates });
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterPriority("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = filterStatus !== "all" || filterPriority !== "all" || search;

  return (
    <AdminLayout title="Callback Requests" description="Manage customer callback requests">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => { setFilterStatus("all"); setCurrentPage(1); }} data-testid="card-total-callbacks">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-callbacks">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-yellow-500 transition-colors" onClick={() => { setFilterStatus("pending"); setCurrentPage(1); }} data-testid="card-pending-callbacks">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => { setFilterStatus("scheduled"); setCurrentPage(1); }} data-testid="card-scheduled-callbacks">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.scheduled || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-green-500 transition-colors" onClick={() => { setFilterStatus("completed"); setCurrentPage(1); }} data-testid="card-completed-callbacks">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-red-500 transition-colors" onClick={() => { setFilterStatus("missed"); setCurrentPage(1); }} data-testid="card-missed-callbacks">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PhoneMissed className="w-4 h-4 text-red-500" />
                Missed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.missed || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or phone..." 
                    className="pl-9" 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    data-testid="input-search-callbacks" 
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-filters">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {hasActiveFilters && (
                        <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary">!</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Callbacks</h4>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Status</label>
                        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-status">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Priority</label>
                        <Select value={filterPriority} onValueChange={(v) => { setFilterPriority(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-priority">
                            <SelectValue placeholder="All priorities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <Button variant="outline" className="w-full" onClick={clearFilters} data-testid="button-clear-filters">
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading callback requests...</div>
            ) : paginatedCallbacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {hasActiveFilters ? "No callback requests match your filters" : "No callback requests yet"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("createdAt")}>
                          <div className="flex items-center gap-1">
                            Requested
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                          <div className="flex items-center gap-1">
                            Name
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("priority")}>
                          <div className="flex items-center gap-1">
                            Priority
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                          <div className="flex items-center gap-1">
                            Status
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCallbacks.map((callback) => {
                        const statusConfig = STATUS_CONFIG[callback.status] || STATUS_CONFIG.pending;
                        const priorityConfig = PRIORITY_CONFIG[callback.priority] || PRIORITY_CONFIG.normal;
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <TableRow key={callback.id} data-testid={`row-callback-${callback.id}`}>
                            <TableCell className="text-sm">
                              <div className="flex flex-col">
                                <span>{format(new Date(callback.createdAt), "MMM dd, yyyy")}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(callback.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                {callback.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <a 
                                href={`tel:${callback.phone}`} 
                                className="flex items-center gap-2 text-primary hover:underline"
                              >
                                <PhoneCall className="w-4 h-4" />
                                {callback.phone}
                              </a>
                            </TableCell>
                            <TableCell className="capitalize">{callback.eventType || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {SOURCE_LABELS[callback.source] || callback.source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenDetail(callback)}
                                  data-testid={`button-view-${callback.id}`}
                                >
                                  View
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleQuickStatusChange(callback.id, "completed")}>
                                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                      Mark Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleQuickStatusChange(callback.id, "scheduled")}>
                                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                      Schedule Call
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleQuickStatusChange(callback.id, "missed")}>
                                      <PhoneMissed className="w-4 h-4 mr-2 text-red-500" />
                                      Mark Missed
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteClick(callback)}
                                      className="text-red-600 focus:text-red-600"
                                      data-testid={`button-delete-${callback.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, sortedCallbacks.length)} of {sortedCallbacks.length} results
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">Page {currentPage} of {totalPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Callback Request Details</DialogTitle>
          </DialogHeader>
          {selectedCallback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedCallback.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <a 
                    href={`tel:${selectedCallback.phone}`} 
                    className="flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedCallback.phone}
                  </a>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                  <p className="capitalize">{selectedCallback.eventType || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p>{SOURCE_LABELS[selectedCallback.source] || selectedCallback.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requested</label>
                  <p>{format(new Date(selectedCallback.createdAt), "PPpp")}</p>
                </div>
                {selectedCallback.calledAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Called At</label>
                    <p>{format(new Date(selectedCallback.calledAt), "PPpp")}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this callback..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDetail} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) setCallbackToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Callback Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the callback request from "{callbackToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
