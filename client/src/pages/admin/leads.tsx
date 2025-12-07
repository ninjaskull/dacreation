import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Users, 
  Phone, 
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  UserPlus,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { leadSources, budgetRanges, eventTypes, leadStatuses } from "@shared/schema";

type LeadWithAssignee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string | null;
  location: string | null;
  budgetRange: string | null;
  status: string;
  leadSource: string;
  guestCount: number | null;
  createdAt: string;
  assignee?: { id: string; name: string | null; username: string } | null;
};

const PAGE_SIZE = 15;

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  inquiry_form: 'Inquiry Form',
  popup: 'Pop-up',
  floating_cta: 'Floating CTA',
  chatbot: 'Chatbot',
  lead_magnet: 'Lead Magnet',
  callback_request: 'Callback',
  contact_form: 'Contact Form',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  'follow-up': 'Follow-up',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

export default function LeadsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterBudget, setFilterBudget] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<LeadWithAssignee | null>(null);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.append("status", filterStatus);
    if (filterEventType !== "all") params.append("eventType", filterEventType);
    if (filterSource !== "all") params.append("leadSource", filterSource);
    if (filterBudget !== "all") params.append("budgetRange", filterBudget);
    if (filterAssignee !== "all") params.append("assignedTo", filterAssignee);
    if (search) params.append("search", search);
    return params.toString();
  };

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ["leads", filterStatus, filterEventType, filterSource, filterBudget, filterAssignee, search],
    queryFn: async () => {
      const queryStr = buildQueryParams();
      const response = await fetch(`/api/leads${queryStr ? `?${queryStr}` : ""}`);
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json() as Promise<LeadWithAssignee[]>;
    },
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team");
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["leadStats"],
    queryFn: async () => {
      const response = await fetch("/api/leads/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete lead");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leadStats"] });
      toast({
        title: "Lead deleted",
        description: "The lead has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (lead: LeadWithAssignee) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteMutation.mutate(leadToDelete.id);
    }
  };

  const sortedLeads = useMemo(() => {
    if (!leads) return [];
    return [...leads].sort((a, b) => {
      let aVal: any = a[sortField as keyof LeadWithAssignee];
      let bVal: any = b[sortField as keyof LeadWithAssignee];
      
      if (sortField === "createdAt" || sortField === "date") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [leads, sortField, sortDirection]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedLeads.slice(start, start + PAGE_SIZE);
  }, [sortedLeads, currentPage]);

  const totalPages = Math.ceil((sortedLeads?.length || 0) / PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await fetch(`/api/leads/export?format=${format}`);
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: `Leads exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export leads",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterEventType("all");
    setFilterSource("all");
    setFilterBudget("all");
    setFilterAssignee("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = filterStatus !== "all" || filterEventType !== "all" || 
    filterSource !== "all" || filterBudget !== "all" || filterAssignee !== "all" || search;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500";
      case "contacted": return "bg-yellow-500";
      case "follow-up": return "bg-orange-500";
      case "qualified": return "bg-green-500";
      case "converted": return "bg-purple-500";
      case "lost": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <AdminLayout title="Leads" description="Manage and track your sales leads">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => { setFilterStatus("all"); setCurrentPage(1); }} data-testid="card-total-leads">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-leads">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => { setFilterStatus("new"); setCurrentPage(1); }} data-testid="card-new-leads">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                New
                <Badge className="bg-blue-500">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-new-leads">{stats?.byStatus?.new || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-yellow-500 transition-colors" onClick={() => { setFilterStatus("contacted"); setCurrentPage(1); }} data-testid="card-contacted-leads">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Contacted
                <Badge className="bg-yellow-500">Contacted</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-contacted-leads">{stats?.byStatus?.contacted || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-orange-500 transition-colors" onClick={() => { setFilterStatus("follow-up"); setCurrentPage(1); }} data-testid="card-followup-leads">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Follow-up
                <Badge className="bg-orange-500">Follow-up</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-followup-leads">{stats?.byStatus?.["follow-up"] || 0}</div>
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
                    placeholder="Search by name, email, phone..." 
                    className="pl-9" 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    data-testid="input-search-leads" 
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
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Leads</h4>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Status</label>
                        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-status">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {leadStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {STATUS_LABELS[status] || status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Event Type</label>
                        <Select value={filterEventType} onValueChange={(v) => { setFilterEventType(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-event-type">
                            <SelectValue placeholder="All event types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Event Types</SelectItem>
                            {eventTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Lead Source</label>
                        <Select value={filterSource} onValueChange={(v) => { setFilterSource(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-source">
                            <SelectValue placeholder="All sources" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            {leadSources.map(source => (
                              <SelectItem key={source} value={source}>
                                {SOURCE_LABELS[source] || source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Budget Range</label>
                        <Select value={filterBudget} onValueChange={(v) => { setFilterBudget(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-budget">
                            <SelectValue placeholder="All budgets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Budgets</SelectItem>
                            {budgetRanges.map(budget => (
                              <SelectItem key={budget.value} value={budget.value}>
                                {budget.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Assigned To</label>
                        <Select value={filterAssignee} onValueChange={(v) => { setFilterAssignee(v); setCurrentPage(1); }}>
                          <SelectTrigger data-testid="select-filter-assignee">
                            <SelectValue placeholder="All team members" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Team Members</SelectItem>
                            {teamMembers?.map((member: any) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name || member.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <Button variant="outline" className="w-full" onClick={clearFilters} data-testid="button-clear-filters">
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-export">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport("csv")} data-testid="export-csv">
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")} data-testid="export-json">
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : paginatedLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {hasActiveFilters ? "No leads match your filters" : "No leads found"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("createdAt")}>
                          <div className="flex items-center gap-1">
                            Date
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                          <div className="flex items-center gap-1">
                            Name
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("eventType")}>
                          <div className="flex items-center gap-1">
                            Event Type
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                          <div className="flex items-center gap-1">
                            Status
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeads.map((lead) => (
                        <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{lead.phone}</span>
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {lead.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{lead.eventType}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {lead.date ? format(new Date(lead.date), "MMM dd, yyyy") : "TBD"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {budgetRanges.find(b => b.value === lead.budgetRange)?.label || lead.budgetRange || "-"}
                          </TableCell>
                          <TableCell className="text-sm max-w-[120px] truncate">
                            {lead.location || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {SOURCE_LABELS[lead.leadSource] || lead.leadSource}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(lead.status)}>
                              {STATUS_LABELS[lead.status] || lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {lead.assignee?.name || lead.assignee?.username || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Link href={`/admin/leads/${lead.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  data-testid={`button-view-${lead.id}`}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/leads/${lead.id}`}>
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <a href={`tel:${lead.phone}`}>Call Lead</a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <a href={`mailto:${lead.email}`}>Send Email</a>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(lead)}
                                    className="text-red-600 focus:text-red-600"
                                    data-testid={`button-delete-${lead.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Lead
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, sortedLeads.length)} of {sortedLeads.length} leads
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(page)}
                            data-testid={`button-page-${page}`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) setLeadToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead "{leadToDelete?.name}"? This action cannot be undone and will remove all associated notes and data.
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
