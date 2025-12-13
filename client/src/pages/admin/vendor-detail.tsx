import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Star, 
  Edit, 
  Save,
  Building2,
  Calendar,
  IndianRupee,
  FileText,
  Tag,
  X
} from "lucide-react";
import type { Vendor } from "@shared/schema";

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
          className={`w-5 h-5 ${
            star <= rating
              ? "fill-amber-500 text-amber-500"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-lg font-medium">{rating > 0 ? rating.toFixed(1) : '-'}</span>
    </div>
  );
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vendor>>({});

  const { data: vendor, isLoading } = useQuery<Vendor>({
    queryKey: ["vendor", id],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${id}`);
      if (!response.ok) throw new Error("Failed to fetch vendor");
      return response.json();
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Vendor>) => {
      const response = await fetch(`/api/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsEditing(false);
      toast({ title: "Vendor updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update vendor", variant: "destructive" });
    },
  });

  const startEditing = () => {
    if (vendor) {
      setEditForm({
        name: vendor.name,
        category: vendor.category,
        contactName: vendor.contactName,
        email: vendor.email,
        phone: vendor.phone,
        alternatePhone: vendor.alternatePhone,
        address: vendor.address,
        city: vendor.city,
        website: vendor.website,
        priceRange: vendor.priceRange,
        description: vendor.description,
        status: vendor.status,
        contractTerms: vendor.contractTerms,
        paymentTerms: vendor.paymentTerms,
        notes: vendor.notes,
        services: vendor.services,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const servicesArray = typeof editForm.services === 'string' 
      ? (editForm.services as string).split(',').map(s => s.trim()).filter(Boolean)
      : editForm.services || [];
    updateMutation.mutate({ ...editForm, services: servicesArray });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Vendor Details" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!vendor) {
    return (
      <AdminLayout title="Vendor Not Found" description="">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Vendor not found</h3>
          <p className="text-muted-foreground mb-4">The vendor you're looking for doesn't exist.</p>
          <Link href="/admin/vendors">
            <Button>Back to Vendors</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Vendor Details" description={vendor.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/vendors">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`}>
                <Button variant="outline" size="sm" data-testid="button-call">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </a>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`}>
                <Button variant="outline" size="sm" data-testid="button-email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </a>
            )}
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save">
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button onClick={startEditing} data-testid="button-edit">
                <Edit className="w-4 h-4 mr-2" />
                Edit Vendor
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-vendor-info">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {vendor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {isEditing ? (
                      <Input 
                        value={editForm.name || ""} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-xl font-bold mb-2"
                        data-testid="input-edit-name"
                      />
                    ) : (
                      <CardTitle className="text-2xl">{vendor.name}</CardTitle>
                    )}
                    <CardDescription className="flex items-center gap-4 mt-2">
                      {isEditing ? (
                        <Select 
                          value={editForm.status || "active"} 
                          onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}
                        >
                          <SelectTrigger className="w-32" data-testid="select-edit-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="blacklisted">Blacklisted</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(vendor.status)
                      )}
                      {isEditing ? (
                        <Select 
                          value={editForm.category || "other"} 
                          onValueChange={(v) => setEditForm(prev => ({ ...prev, category: v }))}
                        >
                          <SelectTrigger className="w-40" data-testid="select-edit-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {vendorCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="capitalize">{vendor.category}</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Contact Person</p>
                          {isEditing ? (
                            <Input 
                              value={editForm.contactName || ""} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, contactName: e.target.value }))}
                              data-testid="input-edit-contact"
                            />
                          ) : (
                            <p className="font-medium">{vendor.contactName || "-"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          {isEditing ? (
                            <Input 
                              value={editForm.phone || ""} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                              data-testid="input-edit-phone"
                            />
                          ) : (
                            <p className="font-medium">{vendor.phone || "-"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Email</p>
                          {isEditing ? (
                            <Input 
                              type="email"
                              value={editForm.email || ""} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              data-testid="input-edit-email"
                            />
                          ) : (
                            <p className="font-medium">{vendor.email || "-"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Website</p>
                          {isEditing ? (
                            <Input 
                              value={editForm.website || ""} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                              data-testid="input-edit-website"
                            />
                          ) : (
                            vendor.website ? (
                              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                                {vendor.website}
                              </a>
                            ) : (
                              <p className="font-medium">-</p>
                            )
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Location</p>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input 
                                placeholder="City"
                                value={editForm.city || ""} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                data-testid="input-edit-city"
                              />
                              <Input 
                                placeholder="Address"
                                value={editForm.address || ""} 
                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                data-testid="input-edit-address"
                              />
                            </div>
                          ) : (
                            <p className="font-medium">{[vendor.address, vendor.city].filter(Boolean).join(", ") || "-"}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Business Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Star className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rating</p>
                          {renderRating(vendor.rating || 0)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Events Completed</p>
                          <p className="font-medium text-lg">{vendor.eventsCompleted || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Price Range</p>
                          {isEditing ? (
                            <Input 
                              placeholder="e.g., ₹50,000 - ₹2,00,000"
                              value={editForm.priceRange || ""} 
                              onChange={(e) => setEditForm(prev => ({ ...prev, priceRange: e.target.value }))}
                              data-testid="input-edit-price"
                            />
                          ) : (
                            <p className="font-medium">{vendor.priceRange || "-"}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Description</h3>
                  {isEditing ? (
                    <Textarea 
                      value={editForm.description || ""} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      data-testid="textarea-edit-description"
                    />
                  ) : (
                    <p className="text-muted-foreground">{vendor.description || "No description available."}</p>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Services Offered
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input 
                        placeholder="Enter services separated by commas"
                        value={Array.isArray(editForm.services) ? editForm.services.join(", ") : (editForm.services || "")} 
                        onChange={(e) => setEditForm(prev => ({ ...prev, services: e.target.value as any }))}
                        data-testid="input-edit-services"
                      />
                      <p className="text-xs text-muted-foreground">Separate multiple services with commas</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {vendor.services && vendor.services.length > 0 ? (
                        vendor.services.map((service, idx) => (
                          <Badge key={idx} variant="secondary">{service}</Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No services listed.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contract & Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Contract Terms</Label>
                  {isEditing ? (
                    <Textarea 
                      value={editForm.contractTerms || ""} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, contractTerms: e.target.value }))}
                      rows={3}
                      className="mt-1"
                      data-testid="textarea-edit-contract"
                    />
                  ) : (
                    <p className="mt-1">{vendor.contractTerms || "No contract terms specified."}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Terms</Label>
                  {isEditing ? (
                    <Textarea 
                      value={editForm.paymentTerms || ""} 
                      onChange={(e) => setEditForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      rows={3}
                      className="mt-1"
                      data-testid="textarea-edit-payment"
                    />
                  ) : (
                    <p className="mt-1">{vendor.paymentTerms || "No payment terms specified."}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea 
                    value={editForm.notes || ""} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    placeholder="Add internal notes about this vendor..."
                    data-testid="textarea-edit-notes"
                  />
                ) : (
                  <p className="text-muted-foreground">{vendor.notes || "No notes added."}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Review Count</span>
                  <span className="font-medium">{vendor.reviewCount || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Events Completed</span>
                  <span className="font-medium">{vendor.eventsCompleted || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">
                    {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
