import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Trash2,
  MoreHorizontal,
  Search,
  Mail,
  Tag,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Send,
  Filter,
  MailOpen,
  MousePointer,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string;
  tags: string[] | null;
  createdAt: string;
  emailsSentCount: number;
  emailsOpenedCount: number;
  emailsClickedCount: number;
  lastEmailSentAt: string | null;
  unsubscribedAt: string | null;
}

interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  pending: number;
  bounced: number;
  complained: number;
  thisWeek: number;
  thisMonth: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  unsubscribed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  bounced: "bg-red-500/10 text-red-500 border-red-500/20",
  complained: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const sourceLabels: Record<string, string> = {
  footer: "Website Footer",
  popup: "Website Popup",
  landing: "Landing Page",
  import: "Import",
  manual: "Manual Entry",
  api: "API",
  other: "Other",
};

export default function AdminSubscribersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkTagDialogOpen, setBulkTagDialogOpen] = useState(false);
  
  const [newSubscriber, setNewSubscriber] = useState({ email: "", name: "", tags: "" });
  const [importData, setImportData] = useState("");
  const [bulkTags, setBulkTags] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const { data: subscribers = [], isLoading } = useQuery<Subscriber[]>({
    queryKey: ["/api/subscribers", statusFilter, sourceFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/subscribers?${params}`);
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      return res.json();
    },
  });

  const { data: stats } = useQuery<SubscriberStats>({
    queryKey: ["/api/subscribers/stats"],
    queryFn: async () => {
      const res = await fetch("/api/subscribers/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; tags?: string[] }) => {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      setAddDialogOpen(false);
      setNewSubscriber({ email: "", name: "", tags: "" });
      toast({ title: "Subscriber added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscribers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      toast({ title: "Subscriber deleted" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/subscribers/bulk/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      setSelectedIds([]);
      setDeleteDialogOpen(false);
      toast({ title: `${data.count} subscribers deleted` });
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const res = await fetch("/api/subscribers/bulk/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      setSelectedIds([]);
      toast({ title: `${data.count} subscribers updated` });
    },
  });

  const bulkTagsMutation = useMutation({
    mutationFn: async ({ ids, tags }: { ids: string[]; tags: string[] }) => {
      const res = await fetch("/api/subscribers/bulk/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, tags }),
      });
      if (!res.ok) throw new Error("Failed to add tags");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      setSelectedIds([]);
      setBulkTagDialogOpen(false);
      setBulkTags("");
      toast({ title: `Tags added to ${data.count} subscribers` });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (subscribersList: { email: string; name?: string }[]) => {
      const res = await fetch("/api/subscribers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribers: subscribersList }),
      });
      if (!res.ok) throw new Error("Failed to import");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      setImportDialogOpen(false);
      setImportData("");
      toast({ title: `Imported ${data.imported} subscribers (${data.skipped} skipped)` });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { subscriberIds?: string[]; subject: string; htmlContent: string }) => {
      const res = await fetch("/api/subscribers/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscribers"] });
      setSendEmailDialogOpen(false);
      setEmailSubject("");
      setEmailContent("");
      setSelectedIds([]);
      toast({ title: `Email sent to ${data.sent} subscribers` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleExport = (format: string) => {
    window.open(`/api/subscribers/export?format=${format}`, "_blank");
  };

  const handleImport = () => {
    const lines = importData.trim().split("\n");
    const subscribers = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return { email: parts[0], name: parts[1] || undefined };
    }).filter(s => s.email);
    importMutation.mutate(subscribers);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(subscribers.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleAddSubscriber = () => {
    const tags = newSubscriber.tags ? newSubscriber.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined;
    createMutation.mutate({ 
      email: newSubscriber.email, 
      name: newSubscriber.name,
      tags 
    });
  };

  const handleBulkAddTags = () => {
    const tags = bulkTags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 0 && selectedIds.length > 0) {
      bulkTagsMutation.mutate({ ids: selectedIds, tags });
    }
  };

  const handleSendEmail = () => {
    sendEmailMutation.mutate({
      subscriberIds: selectedIds.length > 0 ? selectedIds : undefined,
      subject: emailSubject,
      htmlContent: emailContent,
    });
  };

  return (
    <AdminLayout title="Email Subscribers">
      <div className="space-y-6" data-testid="admin-subscribers-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Subscribers</h1>
            <p className="text-muted-foreground">
              Manage your newsletter subscribers and email campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} data-testid="import-button">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="export-button">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setAddDialogOpen(true)} data-testid="add-subscriber-button">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
                {stats?.thisWeek || 0} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.unsubscribed || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total ? Math.round((stats.unsubscribed / stats.total) * 100) : 0}% churn rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">New subscribers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscriber List</CardTitle>
                <CardDescription>
                  {selectedIds.length > 0 ? (
                    <span className="text-primary">{selectedIds.length} selected</span>
                  ) : (
                    `${subscribers.length} subscribers`
                  )}
                </CardDescription>
              </div>
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendEmailDialogOpen(true)}
                    data-testid="bulk-send-email-button"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkTagDialogOpen(true)}
                    data-testid="bulk-add-tags-button"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tags
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Change Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "active" })}>
                        Set Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "pending" })}>
                        Set Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "unsubscribed" })}>
                        Set Unsubscribed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    data-testid="bulk-delete-button"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="search-input"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="complained">Complained</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40" data-testid="source-filter">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="footer">Website Footer</SelectItem>
                  <SelectItem value="popup">Website Popup</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.length === subscribers.length && subscribers.length > 0}
                          onCheckedChange={handleSelectAll}
                          data-testid="select-all-checkbox"
                        />
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-center" title="Emails Sent">
                        <Mail className="h-4 w-4 mx-auto" />
                      </TableHead>
                      <TableHead className="text-center" title="Emails Opened">
                        <MailOpen className="h-4 w-4 mx-auto" />
                      </TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscribers.map((subscriber) => (
                        <TableRow key={subscriber.id} data-testid={`subscriber-row-${subscriber.id}`}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(subscriber.id)}
                              onCheckedChange={(checked) => handleSelectOne(subscriber.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>{subscriber.name || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[subscriber.status] || ""}
                            >
                              {subscriber.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {sourceLabels[subscriber.source] || subscriber.source}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {(subscriber.tags || []).slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {(subscriber.tags || []).length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{subscriber.tags!.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {subscriber.emailsSentCount}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {subscriber.emailsOpenedCount}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(subscriber.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedIds([subscriber.id]);
                                  setSendEmailDialogOpen(true);
                                }}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteMutation.mutate(subscriber.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subscriber</DialogTitle>
              <DialogDescription>
                Add a new subscriber to your mailing list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                  data-testid="add-email-input"
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newSubscriber.name}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                  data-testid="add-name-input"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="vip, newsletter, events"
                  value={newSubscriber.tags}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, tags: e.target.value })}
                  data-testid="add-tags-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddSubscriber} 
                disabled={createMutation.isPending}
                data-testid="confirm-add-button"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Subscriber
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Subscribers</DialogTitle>
              <DialogDescription>
                Paste emails (one per line) or CSV format (email,name)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="email@example.com&#10;another@example.com,John Doe&#10;third@example.com"
                rows={10}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                data-testid="import-textarea"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importMutation.isPending || !importData.trim()}
                data-testid="confirm-import-button"
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={bulkTagDialogOpen} onOpenChange={setBulkTagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tags</DialogTitle>
              <DialogDescription>
                Add tags to {selectedIds.length} selected subscribers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-tags">Tags (comma separated)</Label>
                <Input
                  id="bulk-tags"
                  placeholder="vip, newsletter, events"
                  value={bulkTags}
                  onChange={(e) => setBulkTags(e.target.value)}
                  data-testid="bulk-tags-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkAddTags} 
                disabled={bulkTagsMutation.isPending || !bulkTags.trim()}
                data-testid="confirm-bulk-tags-button"
              >
                {bulkTagsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Tags
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={sendEmailDialogOpen} onOpenChange={setSendEmailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
              <DialogDescription>
                {selectedIds.length > 0
                  ? `Send email to ${selectedIds.length} selected subscribers`
                  : "Send email to all active subscribers"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Your email subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  data-testid="email-subject-input"
                />
              </div>
              <div>
                <Label htmlFor="content">Content (HTML) *</Label>
                <Textarea
                  id="content"
                  placeholder="<p>Your email content here...</p>"
                  rows={8}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  data-testid="email-content-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailContent.trim()}
                data-testid="confirm-send-email-button"
              >
                {sendEmailMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subscribers</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.length} subscribers? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                data-testid="confirm-delete-button"
              >
                {bulkDeleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
