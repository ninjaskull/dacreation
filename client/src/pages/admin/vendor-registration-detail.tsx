import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  CreditCard,
  Shield,
  FileCheck,
  History
} from "lucide-react";
import type { VendorRegistration } from "@shared/schema";
import { vendorDocumentTypes, documentVerificationStatuses } from "@shared/schema";

interface VendorDocument {
  id: string;
  vendorRegistrationId: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  fileSize?: number;
  mimeType?: string;
  verificationStatus: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface VendorApprovalLog {
  id: string;
  vendorRegistrationId: string;
  action: string;
  performedBy: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: string;
  user?: { id: string; name: string | null; username: string };
}

interface VendorRegistrationWithDetails extends VendorRegistration {
  reviewer?: { id: string; name: string | null; username: string } | null;
  approver?: { id: string; name: string | null; username: string } | null;
  documents?: VendorDocument[];
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

const documentTypeLabels: Record<string, string> = {
  pan_card: "PAN Card",
  gst_certificate: "GST Certificate",
  msme_certificate: "MSME Certificate",
  incorporation_certificate: "Incorporation Certificate",
  partnership_deed: "Partnership Deed",
  llp_agreement: "LLP Agreement",
  trade_license: "Trade License",
  fssai_license: "FSSAI License",
  fire_safety_certificate: "Fire Safety Certificate",
  pollution_certificate: "Pollution Certificate",
  shop_establishment: "Shop & Establishment",
  cancelled_cheque: "Cancelled Cheque",
  bank_letter: "Bank Letter",
  liability_insurance: "Liability Insurance",
  company_profile: "Company Profile",
  portfolio: "Portfolio",
  price_list: "Price List",
  reference_letter: "Reference Letter",
  other: "Other",
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: "Draft", color: "bg-slate-500", icon: FileText },
  submitted: { label: "Submitted", color: "bg-blue-500", icon: Clock },
  under_review: { label: "Under Review", color: "bg-amber-500", icon: Clock },
  documents_pending: { label: "Documents Pending", color: "bg-orange-500", icon: AlertTriangle },
  verification_pending: { label: "Verification Pending", color: "bg-purple-500", icon: Clock },
  approved: { label: "Approved", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
  suspended: { label: "Suspended", color: "bg-red-600", icon: AlertTriangle },
  blacklisted: { label: "Blacklisted", color: "bg-red-800", icon: XCircle },
};

const docVerificationConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-500" },
  verified: { label: "Verified", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
  expired: { label: "Expired", color: "bg-gray-500" },
};

const entityTypeLabels: Record<string, string> = {
  sole_proprietor: "Sole Proprietor",
  partnership: "Partnership Firm",
  llp: "Limited Liability Partnership (LLP)",
  private_limited: "Private Limited Company",
  public_limited: "Public Limited Company",
  opc: "One Person Company (OPC)",
  huf: "Hindu Undivided Family (HUF)",
  trust: "Trust",
  society: "Society",
  other: "Other",
};

export default function VendorRegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [actionDialog, setActionDialog] = useState<{ type: "approve" | "reject" | null }>({ type: null });
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [documentVerifyDialog, setDocumentVerifyDialog] = useState<{ document: VendorDocument | null; action: "verify" | "reject" | null }>({ document: null, action: null });
  const [verificationNotes, setVerificationNotes] = useState("");

  const { data: registration, isLoading: isLoadingRegistration } = useQuery<VendorRegistrationWithDetails>({
    queryKey: ["/api/admin/vendor-registrations", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}`);
      if (!response.ok) throw new Error("Failed to fetch vendor registration");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: documents = [] } = useQuery<VendorDocument[]>({
    queryKey: ["/api/admin/vendor-registrations", id, "documents"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: logs = [] } = useQuery<VendorApprovalLog[]>({
    queryKey: ["/api/admin/vendor-registrations", id, "logs"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}/logs`);
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ notes }: { notes?: string }) => {
      const response = await fetch(`/api/admin/vendor-registrations/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error("Failed to approve vendor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations", id, "logs"] });
      toast({ title: "Vendor approved successfully" });
      setActionDialog({ type: null });
      setApprovalNotes("");
    },
    onError: () => {
      toast({ title: "Failed to approve vendor", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ reason }: { reason: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations", id, "logs"] });
      toast({ title: "Vendor rejected" });
      setActionDialog({ type: null });
      setRejectionReason("");
    },
    onError: () => {
      toast({ title: "Failed to reject vendor", variant: "destructive" });
    },
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, status, notes }: { documentId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/admin/vendor-documents/${documentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error("Failed to verify document");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-registrations", id, "documents"] });
      toast({ title: "Document verification updated" });
      setDocumentVerifyDialog({ document: null, action: null });
      setVerificationNotes("");
    },
    onError: () => {
      toast({ title: "Failed to update document verification", variant: "destructive" });
    },
  });

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: "bg-gray-500", icon: Clock };
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const getDocVerificationBadge = (status: string) => {
    const config = docVerificationConfig[status] || { label: status, color: "bg-gray-500" };
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const canApproveOrReject = registration && 
    ["submitted", "under_review", "verification_pending"].includes(registration.status);

  if (isLoadingRegistration) {
    return (
      <AdminLayout title="Vendor Registration" description="Loading...">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!registration) {
    return (
      <AdminLayout title="Vendor Registration" description="Not found">
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Registration Not Found</h3>
            <p className="text-muted-foreground mb-4">The vendor registration you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/admin/vendor-registrations")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={registration.businessName} description="Vendor Registration Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/admin/vendor-registrations")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registrations
          </Button>
          <div className="flex items-center gap-3">
            {getStatusBadge(registration.status)}
            {canApproveOrReject && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setActionDialog({ type: "reject" })}
                  data-testid="button-reject"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setActionDialog({ type: "approve" })}
                  data-testid="button-approve"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              History ({logs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Business Name</Label>
                      <p className="font-medium">{registration.businessName}</p>
                    </div>
                    {registration.brandName && (
                      <div>
                        <Label className="text-muted-foreground text-xs">Brand Name</Label>
                        <p className="font-medium">{registration.brandName}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground text-xs">Entity Type</Label>
                      <p className="font-medium">{entityTypeLabels[registration.entityType] || registration.entityType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Year Established</Label>
                      <p className="font-medium">{registration.yearEstablished || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Employee Count</Label>
                      <p className="font-medium">{registration.employeeCount || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Annual Turnover</Label>
                      <p className="font-medium">{registration.annualTurnover || "-"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-muted-foreground text-xs">Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {registration.categories?.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {categoryLabels[cat] || cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {registration.serviceDescription && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Service Description</Label>
                      <p className="text-sm mt-1">{registration.serviceDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Statutory Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">PAN Number</Label>
                    <p className="font-medium font-mono">{registration.panNumber || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">GST Number</Label>
                    <p className="font-medium font-mono text-sm">{registration.gstNumber || "-"}</p>
                  </div>
                  {registration.msmeNumber && (
                    <div>
                      <Label className="text-muted-foreground text-xs">MSME Number</Label>
                      <p className="font-medium font-mono">{registration.msmeNumber}</p>
                    </div>
                  )}
                  {registration.fssaiNumber && (
                    <div>
                      <Label className="text-muted-foreground text-xs">FSSAI Number</Label>
                      <p className="font-medium font-mono">{registration.fssaiNumber}</p>
                    </div>
                  )}
                  {registration.cinNumber && (
                    <div>
                      <Label className="text-muted-foreground text-xs">CIN Number</Label>
                      <p className="font-medium font-mono text-xs">{registration.cinNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Primary Contact</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-muted-foreground text-xs">Name</Label>
                        <p className="font-medium">{registration.contactPersonName}</p>
                      </div>
                      {registration.contactPersonDesignation && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Designation</Label>
                          <p className="font-medium">{registration.contactPersonDesignation}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${registration.contactPhone}`} className="hover:underline">{registration.contactPhone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${registration.contactEmail}`} className="hover:underline">{registration.contactEmail}</a>
                    </div>
                    {registration.contactWhatsapp && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        WhatsApp: {registration.contactWhatsapp}
                      </div>
                    )}
                  </div>

                  {registration.secondaryContactName && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Secondary Contact</h4>
                        <p>{registration.secondaryContactName}</p>
                        {registration.secondaryContactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {registration.secondaryContactPhone}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registration.registeredAddress && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Registered Address</h4>
                      <p className="text-sm text-muted-foreground">
                        {registration.registeredAddress}
                        {registration.registeredCity && <>, {registration.registeredCity}</>}
                        {registration.registeredState && <>, {registration.registeredState}</>}
                        {registration.registeredPincode && <> - {registration.registeredPincode}</>}
                      </p>
                    </div>
                  )}
                  {registration.operationalAddress && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Operational Address</h4>
                      <p className="text-sm text-muted-foreground">
                        {registration.operationalAddress}
                        {registration.operationalCity && <>, {registration.operationalCity}</>}
                        {registration.operationalState && <>, {registration.operationalState}</>}
                        {registration.operationalPincode && <> - {registration.operationalPincode}</>}
                      </p>
                    </div>
                  )}
                  {registration.serviceCities && registration.serviceCities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Service Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {registration.serviceCities.map((city, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{city}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Banking & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Bank Name</Label>
                      <p className="font-medium">{registration.bankName || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Branch</Label>
                      <p className="font-medium">{registration.bankBranch || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Account Number</Label>
                      <p className="font-medium font-mono">{registration.accountNumber || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">IFSC Code</Label>
                      <p className="font-medium font-mono">{registration.ifscCode || "-"}</p>
                    </div>
                    {registration.upiId && (
                      <div className="col-span-2">
                        <Label className="text-muted-foreground text-xs">UPI ID</Label>
                        <p className="font-medium">{registration.upiId}</p>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Minimum Budget</Label>
                      <p className="font-medium">{formatCurrency(registration.minimumBudget)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Average Event Value</Label>
                      <p className="font-medium">{formatCurrency(registration.averageEventValue)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Advance Required</Label>
                      <p className="font-medium">{registration.advancePercentage ? `${registration.advancePercentage}%` : "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Payment Terms</Label>
                      <p className="font-medium">{registration.paymentTerms || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Online Presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {registration.websiteUrl && (
                    <a 
                      href={registration.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      {registration.websiteUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {registration.instagramUrl && (
                    <a 
                      href={registration.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:underline"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {registration.facebookUrl && (
                    <a 
                      href={registration.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {registration.youtubeUrl && (
                    <a 
                      href={registration.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-red-600 hover:underline"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Years in Business</Label>
                      <p className="font-medium">{registration.yearsInBusiness || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Events Completed</Label>
                      <p className="font-medium">{registration.eventsCompleted || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Registration Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Created</Label>
                    <p className="font-medium">{formatDateTime(registration.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Submitted</Label>
                    <p className="font-medium">{formatDateTime(registration.submittedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Reviewed By</Label>
                    <p className="font-medium">
                      {registration.reviewer?.name || registration.reviewer?.username || "-"}
                    </p>
                    {registration.reviewedAt && (
                      <p className="text-xs text-muted-foreground">{formatDateTime(registration.reviewedAt)}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Approved/Rejected By</Label>
                    <p className="font-medium">
                      {registration.approver?.name || registration.approver?.username || "-"}
                    </p>
                    {registration.approvedAt && (
                      <p className="text-xs text-muted-foreground">{formatDateTime(registration.approvedAt)}</p>
                    )}
                  </div>
                </div>
                {registration.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <Label className="text-red-600 text-xs">Rejection Reason</Label>
                    <p className="text-sm text-red-800 mt-1">{registration.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Uploaded Documents
                </CardTitle>
                <CardDescription>
                  Verify each document before approving the vendor registration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documents Uploaded</h3>
                    <p className="text-muted-foreground">The vendor hasn't uploaded any documents yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        data-testid={`document-${doc.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{documentTypeLabels[doc.documentType] || doc.documentType}</p>
                            <p className="text-sm text-muted-foreground">{doc.documentName}</p>
                            {doc.expiryDate && (
                              <p className="text-xs text-muted-foreground">Expires: {formatDate(doc.expiryDate)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getDocVerificationBadge(doc.verificationStatus)}
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </a>
                          {doc.verificationStatus === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => setDocumentVerifyDialog({ document: doc, action: "verify" })}
                                data-testid={`button-verify-${doc.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => setDocumentVerifyDialog({ document: doc, action: "reject" })}
                                data-testid={`button-reject-doc-${doc.id}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Approval History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No History Yet</h3>
                    <p className="text-muted-foreground">Actions taken on this registration will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {log.action === "approved" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {log.action === "rejected" && <XCircle className="h-4 w-4 text-red-600" />}
                          {log.action === "submitted" && <FileText className="h-4 w-4 text-blue-600" />}
                          {!["approved", "rejected", "submitted"].includes(log.action) && (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium capitalize">{log.action.replace(/_/g, " ")}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            By {log.user?.name || log.user?.username || "System"}
                          </p>
                          {log.previousStatus && log.newStatus && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Status: {log.previousStatus} → {log.newStatus}
                            </p>
                          )}
                          {log.notes && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">{log.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={actionDialog.type === "approve"} onOpenChange={() => setActionDialog({ type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Vendor Registration</DialogTitle>
            <DialogDescription>
              Approve <strong>{registration.businessName}</strong> as a verified vendor partner.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="approval-notes">Notes (Optional)</Label>
            <Textarea
              id="approval-notes"
              placeholder="Add any notes about this approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="mt-2"
              rows={3}
              data-testid="input-approval-notes"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ type: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => approveMutation.mutate({ notes: approvalNotes })}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending ? "Approving..." : "Approve Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialog.type === "reject"} onOpenChange={() => { setActionDialog({ type: null }); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting <strong>{registration.businessName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
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
            <Button variant="outline" onClick={() => { setActionDialog({ type: null }); setRejectionReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ reason: rejectionReason })}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={documentVerifyDialog.action !== null} 
        onOpenChange={() => { setDocumentVerifyDialog({ document: null, action: null }); setVerificationNotes(""); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {documentVerifyDialog.action === "verify" ? "Verify Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {documentVerifyDialog.action === "verify" 
                ? `Confirm that the ${documentTypeLabels[documentVerifyDialog.document?.documentType || ""] || "document"} is valid and authentic.`
                : `Provide a reason for rejecting this ${documentTypeLabels[documentVerifyDialog.document?.documentType || ""] || "document"}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="verification-notes">Notes {documentVerifyDialog.action === "reject" ? "*" : "(Optional)"}</Label>
            <Textarea
              id="verification-notes"
              placeholder={documentVerifyDialog.action === "reject" ? "Reason for rejection..." : "Any notes about this document..."}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="mt-2"
              rows={3}
              data-testid="input-verification-notes"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDocumentVerifyDialog({ document: null, action: null }); setVerificationNotes(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (documentVerifyDialog.document) {
                  verifyDocumentMutation.mutate({
                    documentId: documentVerifyDialog.document.id,
                    status: documentVerifyDialog.action === "verify" ? "verified" : "rejected",
                    notes: verificationNotes,
                  });
                }
              }}
              disabled={verifyDocumentMutation.isPending || (documentVerifyDialog.action === "reject" && !verificationNotes.trim())}
              className={documentVerifyDialog.action === "verify" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={documentVerifyDialog.action === "reject" ? "destructive" : "default"}
              data-testid="button-confirm-verify"
            >
              {verifyDocumentMutation.isPending 
                ? "Processing..." 
                : documentVerifyDialog.action === "verify" ? "Verify Document" : "Reject Document"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
