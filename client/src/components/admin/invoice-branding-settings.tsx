import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Upload, Loader2 } from "lucide-react";
import type { InvoiceTemplate, CompanySettings } from "@shared/schema";

interface InvoiceBrandingSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceBrandingSettings({ open, onOpenChange }: InvoiceBrandingSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<InvoiceTemplate>>({
    name: "Da Creation Events - Default",
    layout: "modernPremium",
    companyName: "Da Creation Events and Decor",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "info@dacreation.in",
    companyGst: "",
    bankName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankBranch: "",
    upiId: "",
    footerText: "Thank you for your business!",
    termsAndConditions: "",
    showLogo: true,
    showBankDetails: true,
    showUpi: true,
    showGst: true,
    logoUrl: "",
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { data: brandingData } = useQuery({
    queryKey: ["/api/invoice-branding"],
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: Partial<InvoiceTemplate>) => {
      const templateId = brandingData?.template?.id || "default";
      const res = await fetch(`/api/invoice-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Branding settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-branding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Failed to update settings", description: error.message, variant: "destructive" });
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName?.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }
    await updateTemplateMutation.mutateAsync(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Invoice Branding Settings
          </DialogTitle>
          <DialogDescription>
            Configure company details, branding, and bank information for invoice PDFs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          {/* Company Details Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={formData.companyEmail || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
                    placeholder="company@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={formData.companyPhone || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyPhone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea
                    id="company-address"
                    value={formData.companyAddress || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    placeholder="Company address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-gst">GST Number</Label>
                  <Input
                    id="company-gst"
                    value={formData.companyGst || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyGst: e.target.value }))}
                    placeholder="Your GST Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center gap-3">
                    {formData.logoUrl && (
                      <img src={formData.logoUrl} alt="Logo preview" className="h-12 w-12 object-contain border rounded p-1" />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG or GIF (Max 5MB)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Details Tab */}
          <TabsContent value="bank" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bank Information</CardTitle>
                <CardDescription>Used for payment instructions on invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={formData.bankName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Bank name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-account">Account Number</Label>
                  <Input
                    id="bank-account"
                    value={formData.bankAccountNumber || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                    placeholder="Bank account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-ifsc">IFSC Code</Label>
                  <Input
                    id="bank-ifsc"
                    value={formData.bankIfsc || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankIfsc: e.target.value }))}
                    placeholder="IFSC code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-branch">Branch</Label>
                  <Input
                    id="bank-branch"
                    value={formData.bankBranch || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                    placeholder="Branch name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    value={formData.upiId || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                    placeholder="name@upi"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template Style</CardTitle>
                <CardDescription>Choose how your invoices look</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="layout">Invoice Template</Label>
                  <Select
                    value={formData.layout || "modernPremium"}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, layout: value }))}
                  >
                    <SelectTrigger id="layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modernPremium">Modern Premium</SelectItem>
                      <SelectItem value="cleanMinimal">Clean Minimal</SelectItem>
                      <SelectItem value="corporateProfessional">Corporate Professional</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modern Premium: Gradient header with gold accents. Clean Minimal: Simple professional. Corporate: Traditional business style.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Input
                    id="footer-text"
                    value={formData.footerText || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="Thank you for your business!"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={formData.termsAndConditions || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    placeholder="Enter terms and conditions here..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Display Options</CardTitle>
                <CardDescription>Control what appears on your invoices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-logo">Show Logo</Label>
                  <Switch
                    id="show-logo"
                    checked={formData.showLogo !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showLogo: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-gst">Show GST Number</Label>
                  <Switch
                    id="show-gst"
                    checked={formData.showGst !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showGst: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-bank">Show Bank Details</Label>
                  <Switch
                    id="show-bank"
                    checked={formData.showBankDetails !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showBankDetails: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-upi">Show UPI</Label>
                  <Switch
                    id="show-upi"
                    checked={formData.showUpi !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showUpi: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={updateTemplateMutation.isPending}
          >
            {updateTemplateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
