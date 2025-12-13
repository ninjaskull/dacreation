import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Building2, 
  Users, 
  AlertTriangle,
  Trash2,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import type { VendorRegistration } from "@shared/schema";
import { vendorCategoryTypes, vendorRegistrationStatuses } from "@shared/schema";

interface VendorRegistrationStats {
  total: number;
  byStatus: Record<string, number>;
  pendingReview: number;
  recentSubmissions: number;
}

const categoryLabels: Record<string, string> = {
  catering: "Catering",
  decoration: "Decoration",
  photography: "Photography",
  videography: "Videography",
  venue: "Venue",
  florist: "Florist",
  mehendi: "Mehendi",
  makeup: "Makeup",
  entertainment: "Entertainment",
  dj: "DJ",
  band: "Band",
  choreographer: "Choreographer",
  lighting: "Lighting",
  sound: "Sound",
  tent_house: "Tent House",
  invitation_cards: "Invitation Cards",
  transportation: "Transportation",
  security: "Security",
  hospitality: "Hospitality",
  pandit_priest: "Pandit/Priest",
  wedding_planner: "Wedding Planner",
  anchor_emcee: "Anchor/Emcee",
  fireworks: "Fireworks",
  destination_services: "Destination Services",
  travel_agent: "Travel Agent",
  hotel_accommodation: "Hotel Accommodation",
  jewellery: "Jewellery",
  bridal_wear: "Bridal Wear",
  groom_wear: "Groom Wear",
  gifting: "Gifting",
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Draft", color: "bg-slate-500", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-500", icon: Clock },
  under_review: { label: "Under Review", color: "bg-amber-500", icon: Eye },
  documents_pending: { label: "Documents Pending", color: "bg-orange-500", icon: AlertTriangle },
  verification_pending: { label: "Verification Pending", color: "bg-purple-500", icon: Clock },
  approved: { label: "Approved", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
  suspended: { label: "Suspended", color: "bg-red-600", icon: AlertTriangle },
  blacklisted: { label: "Blacklisted", color: "bg-red-800", icon: XCircle },
};

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry"
];

export default function VendorRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<VendorRegistration | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: "approve" | "reject" | "delete" | null; registration: VendorRegistration | null }>({ type: null, registration: null });
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (categoryFilter !== "all") params.append("category", categoryFilter);
    if (stateFilter !== "all") params.append("state", stateFilter);
    return params.toString();
  };

  const { data: registrations = [], isLoading } = useQuery<VendorRegistration[]>({
    queryKey: ["/api/admin/vendor-registrations", searchQuery, statusFilter, categoryFilter, stateFilter],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/admin/vendor-registrations?${queryString}`);
      if (!response.ok) throw new Error("Failed to fetch vendor registrations");
      return response.json();
    },
  });

  const { data: stats } = useQuery<VendorRegistrationStats>({
    queryKey: ["/api/admin/vendor-registrations/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/vendor-registrations/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to approve vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations/stats"] });
      toast({ title: "Vendor approved successfully" });
      setActionDialog({ type: null, registration: null });
    },
    onError: () => {
      toast({ title: "Failed to approve vendor", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations/stats"] });
      toast({ title: "Vendor rejected" });
      setActionDialog({ type: null, registration: null });
      setRejectionReason("");
    },
    onError: () => {
      toast({ title: "Failed to reject vendor", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete vendor registration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations/stats"] });
      toast({ title: "Vendor registration deleted" });
      setActionDialog({ type: null, registration: null });
    },
    onError: () => {
      toast({ title: "Failed to delete vendor registration", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: "bg-gray-500", icon: Clock };
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadges = (categories: string[] | null) => {
    if (!categories || categories.length === 0) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {categories.slice(0, 2).map((cat) => (
          <Badge key={cat} variant="outline" className="text-xs">
            {categoryLabels[cat] || cat}
          </Badge>
        ))}
        {categories.length > 2 && (
          <Badge variant="outline" className="text-xs">+{categories.length - 2}</Badge>
        )}
      </div>
    );
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStateFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all" || stateFilter !== "all" || searchQuery !== "";

  return (
    <AdminLayout title="Vendor Registrations" description="Review and manage vendor applications">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-registrations">
                {stats?.total || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600" data-testid="text-pending-review">
                {stats?.pendingReview || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-approved">
                {stats?.byStatus?.approved || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-recent">
                {stats?.recentSubmissions || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name, contact..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-registrations"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="filter-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {vendorRegistrationStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusConfig[status]?.label || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {vendorCategoryTypes.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat] || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-primary/10" : ""}
                  data-testid="button-more-filters"
                >
                  <Filter className="w-4 h-4" />
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">State</Label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger data-testid="filter-state">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No vendor registrations found</h3>
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "Try adjusting your filters" : "Vendor applications will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{registration.businessName}</p>
                            {registration.brandName && registration.brandName !== registration.businessName && (
                              <p className="text-sm text-muted-foreground">({registration.brandName})</p>
                            )}
                            <p className="text-xs text-muted-foreground capitalize">
                              {registration.entityType?.replace(/_/g, " ")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCategoryBadges(registration.categories)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{registration.contactPersonName}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {registration.contactPhone}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {registration.contactEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>
                              {registration.operationalCity || registration.registeredCity || "-"}
                              {(registration.operationalState || registration.registeredState) && (
                                <>, {registration.operationalState || registration.registeredState}</>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(registration.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(registration.submittedAt || registration.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${registration.id}`}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/vendor-registrations/${registration.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {registration.websiteUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={registration.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Visit Website
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {(registration.status === "submitted" || registration.status === "under_review" || registration.status === "verification_pending") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => setActionDialog({ type: "approve", registration })}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setActionDialog({ type: "reject", registration })}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "delete", registration })}
                                className="text-red-600"
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialog.type === "approve"} onOpenChange={() => setActionDialog({ type: null, registration: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Vendor Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve <strong>{actionDialog.registration?.businessName}</strong>? 
              This will create an active vendor profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, registration: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => actionDialog.registration && approveMutation.mutate(actionDialog.registration.id)}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending ? "Approving..." : "Approve Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog.type === "reject"} onOpenChange={() => { setActionDialog({ type: null, registration: null }); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting <strong>{actionDialog.registration?.businessName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
              data-testid="input-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog({ type: null, registration: null }); setRejectionReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => actionDialog.registration && rejectMutation.mutate({ id: actionDialog.registration.id, reason: rejectionReason })}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog.type === "delete"} onOpenChange={() => setActionDialog({ type: null, registration: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the registration for <strong>{actionDialog.registration?.businessName}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null, registration: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => actionDialog.registration && deleteMutation.mutate(actionDialog.registration.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
