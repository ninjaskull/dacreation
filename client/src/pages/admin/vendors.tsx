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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Mail, Phone, MoreHorizontal, Star, Edit, Trash2, Download, Building2, Users, CheckCircle } from "lucide-react";
import type { Vendor } from "@shared/schema";

interface VendorStats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  topRated: number;
}

const vendorCategories = [
  { value: "florist", label: "Florist" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "entertainment", label: "Entertainment" },
  { value: "venue", label: "Venue" },
  { value: "decor", label: "Decor" },
  { value: "lighting", label: "Lighting" },
  { value: "sound", label: "Sound" },
  { value: "transportation", label: "Transportation" },
  { value: "makeup", label: "Makeup" },
  { value: "mehendi", label: "Mehendi" },
  { value: "invitation", label: "Invitation" },
  { value: "other", label: "Other" },
];

export default function VendorsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors", { search: searchQuery, category: categoryFilter, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const response = await fetch(`/api/vendors?${params}`);
      if (!response.ok) throw new Error("Failed to fetch vendors");
      return response.json();
    },
  });

  const { data: stats } = useQuery<VendorStats>({
    queryKey: ["/api/vendors/stats"],
    queryFn: async () => {
      const response = await fetch("/api/vendors/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsDialogOpen(false);
      toast({ title: "Vendor created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create vendor", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
      const response = await fetch(`/api/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsDialogOpen(false);
      setEditingVendor(null);
      toast({ title: "Vendor updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update vendor", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({ title: "Vendor deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete vendor", variant: "destructive" });
    },
  });

  const handleExport = async () => {
    window.open("/api/vendors/export?format=csv", "_blank");
    toast({ title: "Export started" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const servicesRaw = formData.get("services") as string || "";
    const services = servicesRaw.split(",").map(s => s.trim()).filter(Boolean);
    
    const data: any = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      contactName: formData.get("contactName") as string || null,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      alternatePhone: formData.get("alternatePhone") as string || null,
      address: formData.get("address") as string || null,
      city: formData.get("city") as string || null,
      website: formData.get("website") as string || null,
      priceRange: formData.get("priceRange") as string || null,
      description: formData.get("description") as string || null,
      status: formData.get("status") as string,
      contractTerms: formData.get("contractTerms") as string || null,
      paymentTerms: formData.get("paymentTerms") as string || null,
      notes: formData.get("notes") as string || null,
      services: services,
    };

    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "inactive": return <Badge className="bg-gray-500">Inactive</Badge>;
      case "pending": return <Badge className="bg-blue-500">Pending</Badge>;
      case "blacklisted": return <Badge className="bg-red-500">Blacklisted</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-500 text-amber-500"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating > 0 ? rating.toFixed(1) : '-'}</span>
      </div>
    );
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingVendor(null);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout title="Vendors" description="Manage your vendor partnerships">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Vendor Directory</h2>
            <p className="text-muted-foreground">Trusted partners for exceptional events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-vendors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewDialog} data-testid="button-add-vendor">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input id="name" name="name" defaultValue={editingVendor?.name || ""} required data-testid="input-vendor-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" defaultValue={editingVendor?.category || "other"}>
                        <SelectTrigger data-testid="select-vendor-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Person</Label>
                      <Input id="contactName" name="contactName" defaultValue={editingVendor?.contactName || ""} data-testid="input-vendor-contact" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingVendor?.email || ""} data-testid="input-vendor-email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={editingVendor?.phone || ""} data-testid="input-vendor-phone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input id="alternatePhone" name="alternatePhone" defaultValue={editingVendor?.alternatePhone || ""} data-testid="input-vendor-altphone" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" defaultValue={editingVendor?.city || ""} data-testid="input-vendor-city" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceRange">Price Range</Label>
                      <Input id="priceRange" name="priceRange" placeholder="e.g., ₹50,000 - ₹2,00,000" defaultValue={editingVendor?.priceRange || ""} data-testid="input-vendor-price" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={editingVendor?.status || "active"}>
                        <SelectTrigger data-testid="select-vendor-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="blacklisted">Blacklisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" defaultValue={editingVendor?.website || ""} data-testid="input-vendor-website" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" defaultValue={editingVendor?.address || ""} data-testid="input-vendor-address" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={editingVendor?.description || ""} rows={2} data-testid="textarea-vendor-description" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="services">Services (comma separated)</Label>
                      <Input id="services" name="services" placeholder="e.g., Bridal Bouquet, Stage Decoration, Centerpieces" defaultValue={editingVendor?.services?.join(", ") || ""} data-testid="input-vendor-services" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractTerms">Contract Terms</Label>
                      <Textarea id="contractTerms" name="contractTerms" defaultValue={editingVendor?.contractTerms || ""} rows={2} data-testid="textarea-vendor-contract" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Textarea id="paymentTerms" name="paymentTerms" defaultValue={editingVendor?.paymentTerms || ""} rows={2} data-testid="textarea-vendor-payment" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Internal Notes</Label>
                      <Textarea id="notes" name="notes" defaultValue={editingVendor?.notes || ""} rows={2} data-testid="textarea-vendor-notes" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-vendor">
                      {editingVendor ? "Update Vendor" : "Add Vendor"}
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
                <Building2 className="w-4 h-4" />
                Total Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-vendors">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Active Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-active-vendors">{stats?.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Top Rated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600" data-testid="text-top-rated">{stats?.topRated || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-categories">
                {Object.keys(stats?.byCategory || {}).length}
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
                  placeholder="Search vendors..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-vendors" 
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {vendorCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]" data-testid="filter-status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
            ) : vendors.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No vendors found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first vendor</p>
                <Button onClick={openNewDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {vendor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            {vendor.contactName && (
                              <p className="text-sm text-muted-foreground">{vendor.contactName}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {vendor.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {vendor.email}
                            </div>
                          )}
                          {vendor.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {vendor.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {vendor.services?.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{service}</Badge>
                          ))}
                          {(vendor.services?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">+{(vendor.services?.length || 0) - 2}</Badge>
                          )}
                          {!vendor.services?.length && <span className="text-muted-foreground text-sm">-</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderRating(vendor.rating || 0)}
                      </TableCell>
                      <TableCell>{vendor.eventsCompleted || 0}</TableCell>
                      <TableCell>
                        {getStatusBadge(vendor.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-vendor-menu-${vendor.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this vendor?")) {
                                  deleteMutation.mutate(vendor.id);
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
