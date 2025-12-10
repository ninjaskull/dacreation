import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Mail, 
  Search, 
  Filter, 
  RefreshCcw, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  TrendingUp,
  Send,
  Calendar,
  User,
  FileText,
  BarChart3,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface EmailLog {
  id: string;
  templateId: string | null;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  status: string;
  errorMessage: string | null;
  type: string;
  sentAt: string | null;
  createdAt: string;
}

interface EmailLogStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  successRate: number;
}

interface FilteredLogsResponse {
  logs: EmailLog[];
  total: number;
}

const emailTypes = ["notification", "transactional", "internal", "marketing", "reminder"];
const emailStatuses = ["sent", "failed", "pending"];

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const limit = 25;

  const buildQueryKey = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/api/email-logs/filtered?${params.toString()}`;
  };

  const { data: logsData, isLoading: loadingLogs, refetch: refetchLogs } = useQuery<FilteredLogsResponse>({
    queryKey: [buildQueryKey()],
    queryFn: async () => {
      const response = await fetch(buildQueryKey());
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
  });

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery<EmailLogStats>({
    queryKey: ["/api/email-logs/stats"],
    queryFn: async () => {
      const response = await fetch("/api/email-logs/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const invalidateEmailLogs = () => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === 'string' && key.includes('/api/email-logs');
      }
    });
  };

  const resendMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email-logs/${id}/resend`, { method: "POST" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resend email");
      }
      return response.json();
    },
    onSuccess: () => {
      invalidateEmailLogs();
      toast({ title: "Email resent successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/email-logs/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete log");
      return response.json();
    },
    onSuccess: () => {
      invalidateEmailLogs();
      toast({ title: "Log deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/email-logs/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to delete logs");
      return response.json();
    },
    onSuccess: (data) => {
      invalidateEmailLogs();
      setSelectedLogs([]);
      toast({ title: `${data.count} logs deleted successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const logs = logsData?.logs || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(logs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLogs([...selectedLogs, id]);
    } else {
      setSelectedLogs(selectedLogs.filter(logId => logId !== id));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      sent: "bg-green-100 text-green-700 border-green-200",
      failed: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
      <Badge variant="outline" className={colors[status] || "bg-gray-100 text-gray-700"}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      notification: "bg-blue-100 text-blue-700",
      transactional: "bg-green-100 text-green-700",
      internal: "bg-purple-100 text-purple-700",
      marketing: "bg-orange-100 text-orange-700",
      reminder: "bg-yellow-100 text-yellow-700",
    };
    return <Badge className={colors[type] || "bg-gray-100 text-gray-700"}>{type}</Badge>;
  };

  const handleRefresh = () => {
    refetchLogs();
    refetchStats();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleViewDetails = (log: EmailLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ["ID", "Recipient Email", "Recipient Name", "Subject", "Type", "Status", "Error Message", "Sent At", "Created At"];
    const rows = logs.map(log => [
      log.id,
      log.recipientEmail,
      log.recipientName || "",
      log.subject,
      log.type,
      log.status,
      log.errorMessage || "",
      log.sentAt || "",
      log.createdAt
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `email-logs-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Notifications" description="Monitor and manage all email notifications sent through the system">
      <div className="space-y-6">
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="logs" className="gap-2" data-testid="tab-logs">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email Logs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-sent">{stats?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">All time email notifications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="text-success-rate">
                    {stats?.successRate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.sent || 0} delivered of {stats?.total || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600" data-testid="text-failed">{stats?.failed || 0}</div>
                  <p className="text-xs text-muted-foreground">Delivery failures</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-today">{stats?.today || 0}</div>
                  <p className="text-xs text-muted-foreground">Emails sent today</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>By Email Type</CardTitle>
                  <CardDescription>Distribution of emails by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.byType && Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(type)}
                        </div>
                        <span className="font-medium" data-testid={`text-type-count-${type}`}>{count}</span>
                      </div>
                    ))}
                    {(!stats?.byType || Object.keys(stats.byType).length === 0) && (
                      <p className="text-sm text-muted-foreground">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Status</CardTitle>
                  <CardDescription>Email delivery breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status)}
                        </div>
                        <span className="font-medium" data-testid={`text-status-count-${status}`}>{count}</span>
                      </div>
                    ))}
                    {(!stats?.byStatus || Object.keys(stats.byStatus).length === 0) && (
                      <p className="text-sm text-muted-foreground">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Time Period Summary</CardTitle>
                <CardDescription>Email activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold" data-testid="text-today-summary">{stats?.today || 0}</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold" data-testid="text-week-summary">{stats?.thisWeek || 0}</p>
                    <p className="text-sm text-muted-foreground">This Week</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold" data-testid="text-month-summary">{stats?.thisMonth || 0}</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <CardTitle>Email Log History</CardTitle>
                    <CardDescription>
                      {totalLogs} total notifications • Page {page} of {totalPages || 1}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh">
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToCSV} disabled={logs.length === 0} data-testid="button-export">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    {selectedLogs.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" data-testid="button-bulk-delete">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete ({selectedLogs.length})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Selected Logs</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {selectedLogs.length} selected log(s)? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => bulkDeleteMutation.mutate(selectedLogs)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by email, subject, or recipient..."
                          value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                          className="pl-9"
                          data-testid="input-search"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                      <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {emailStatuses.map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                      <SelectTrigger className="w-[150px]" data-testid="select-type-filter">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {emailTypes.map(t => (
                          <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={handleClearFilters} data-testid="button-clear-filters">
                      <Filter className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="date-from" className="text-sm whitespace-nowrap">From:</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                        className="w-[150px]"
                        data-testid="input-date-from"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="date-to" className="text-sm whitespace-nowrap">To:</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={dateTo}
                        onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                        className="w-[150px]"
                        data-testid="input-date-to"
                      />
                    </div>
                  </div>

                  <Separator />

                  {loadingLogs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No email logs found</h3>
                      <p className="text-sm text-muted-foreground">
                        {search || statusFilter !== "all" || typeFilter !== "all" 
                          ? "Try adjusting your filters" 
                          : "Email logs will appear here once emails are sent"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]">
                                <Checkbox
                                  checked={selectedLogs.length === logs.length && logs.length > 0}
                                  onCheckedChange={handleSelectAll}
                                  data-testid="checkbox-select-all"
                                />
                              </TableHead>
                              <TableHead>Recipient</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {logs.map((log) => (
                              <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedLogs.includes(log.id)}
                                    onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
                                    data-testid={`checkbox-log-${log.id}`}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium truncate max-w-[200px]" data-testid={`text-email-${log.id}`}>
                                      {log.recipientEmail}
                                    </span>
                                    {log.recipientName && (
                                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {log.recipientName}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="truncate max-w-[250px] block" title={log.subject}>
                                    {log.subject}
                                  </span>
                                </TableCell>
                                <TableCell>{getTypeBadge(log.type)}</TableCell>
                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm">{format(new Date(log.createdAt), "MMM d, yyyy")}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleViewDetails(log)}
                                      data-testid={`button-view-${log.id}`}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {log.status === "failed" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => resendMutation.mutate(log.id)}
                                        disabled={resendMutation.isPending}
                                        data-testid={`button-resend-${log.id}`}
                                      >
                                        <RotateCcw className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" data-testid={`button-delete-${log.id}`}>
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Log</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this email log? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => deleteMutation.mutate(log.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>

                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-muted-foreground">
                          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalLogs)} of {totalLogs} entries
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            data-testid="button-prev-page"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm px-2">Page {page} of {totalPages || 1}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            data-testid="button-next-page"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Log Details</DialogTitle>
              <DialogDescription>Detailed information about this notification</DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedLog.type)}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Recipient Email</Label>
                    <p className="font-medium" data-testid="detail-email">{selectedLog.recipientEmail}</p>
                  </div>
                  {selectedLog.recipientName && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase">Recipient Name</Label>
                      <p className="font-medium">{selectedLog.recipientName}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Subject</Label>
                    <p className="font-medium" data-testid="detail-subject">{selectedLog.subject}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase">Created At</Label>
                    <p className="font-medium">{format(new Date(selectedLog.createdAt), "PPpp")}</p>
                  </div>
                  {selectedLog.sentAt && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase">Sent At</Label>
                      <p className="font-medium">{format(new Date(selectedLog.sentAt), "PPpp")}</p>
                    </div>
                  )}
                </div>

                {selectedLog.errorMessage && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase">Error Message</Label>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700" data-testid="detail-error">{selectedLog.errorMessage}</p>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-muted-foreground text-xs uppercase">Log ID</Label>
                  <p className="font-mono text-xs text-muted-foreground">{selectedLog.id}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedLog?.status === "failed" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    resendMutation.mutate(selectedLog.id);
                    setDetailDialogOpen(false);
                  }}
                  disabled={resendMutation.isPending}
                  data-testid="button-resend-detail"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resend Email
                </Button>
              )}
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
