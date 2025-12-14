import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, User, MapPin, Briefcase, CreditCard, FileText, CheckCircle2, 
  ChevronLeft, ChevronRight, Loader2, Upload, X, File, Shield, Sparkles,
  Phone, Mail, Globe, Instagram, Facebook, Youtube, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useBranding } from "@/contexts/BrandingContext";

const businessEntityTypes = [
  "proprietorship", "partnership", "llp", "private_limited", "public_limited",
  "trust", "society", "huf", "individual"
] as const;

const employeeCountOptions = ["1-5", "6-10", "11-25", "26-50", "51-100", "100+"];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli", "Daman and Diu", "Lakshadweep"
];

const vendorRegistrationSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  brandName: z.string().optional(),
  entityType: z.enum(businessEntityTypes),
  yearEstablished: z.number().min(1900).max(new Date().getFullYear()).optional(),
  employeeCount: z.string().optional(),
  annualTurnover: z.string().optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format").optional().or(z.literal("")),
  gstState: z.string().optional(),
  msmeNumber: z.string().optional(),
  fssaiNumber: z.string().optional(),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  contactPersonDesignation: z.string().optional(),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactWhatsapp: z.string().optional(),
  secondaryContactName: z.string().optional(),
  secondaryContactPhone: z.string().optional(),
  registeredAddress: z.string().optional(),
  registeredCity: z.string().optional(),
  registeredState: z.string().optional(),
  registeredPincode: z.string().optional(),
  operationalAddress: z.string().optional(),
  operationalCity: z.string().optional(),
  operationalState: z.string().optional(),
  operationalPincode: z.string().optional(),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  primaryCategory: z.string().optional(),
  serviceDescription: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  serviceCities: z.array(z.string()).optional(),
  serviceStates: z.array(z.string()).optional(),
  panIndiaService: z.boolean().optional(),
  minimumGuestCapacity: z.number().optional(),
  maximumGuestCapacity: z.number().optional(),
  eventsPerMonth: z.number().optional(),
  staffStrength: z.number().optional(),
  equipmentOwned: z.boolean().optional(),
  equipmentDetails: z.string().optional(),
  minimumBudget: z.number().optional(),
  averageEventValue: z.number().optional(),
  pricingTier: z.string().optional(),
  paymentTerms: z.string().optional(),
  advancePercentage: z.number().min(0).max(100).optional(),
  acceptsOnlinePayment: z.boolean().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
  upiId: z.string().optional(),
  yearsInBusiness: z.number().optional(),
  eventsCompleted: z.number().optional(),
  websiteUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  hasLiabilityInsurance: z.boolean().optional(),
  hasFireSafetyCertificate: z.boolean().optional(),
  hasPollutionCertificate: z.boolean().optional(),
  hasNoPendingLitigation: z.boolean().optional(),
  hasNeverBlacklisted: z.boolean().optional(),
  agreesToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  agreesToNda: z.boolean().optional(),
});

type VendorRegistrationForm = z.infer<typeof vendorRegistrationSchema>;

const steps = [
  { id: 1, title: "Business Profile", icon: Building2, description: "Tell us about your company" },
  { id: 2, title: "Contact Details", icon: User, description: "How can we reach you?" },
  { id: 3, title: "Services & Coverage", icon: Briefcase, description: "What do you offer?" },
  { id: 4, title: "Complete Registration", icon: CheckCircle2, description: "Final details & submit" },
];

interface UploadedDocument {
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

const documentTypeLabels: Record<string, string> = {
  pan_card: "PAN Card",
  gst_certificate: "GST Certificate",
  company_profile: "Company Profile",
  portfolio: "Portfolio",
};

export default function VendorRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { branding } = useBranding();

  const { data: vendorCategories = [] } = useQuery<string[]>({
    queryKey: ["/api/vendor-categories"],
  });

  const form = useForm<VendorRegistrationForm>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      entityType: "proprietorship",
      categories: [],
      panIndiaService: false,
      equipmentOwned: false,
      acceptsOnlinePayment: false,
      hasLiabilityInsurance: false,
      hasFireSafetyCertificate: false,
      hasPollutionCertificate: false,
      hasNoPendingLitigation: true,
      hasNeverBlacklisted: true,
      agreesToTerms: false,
      agreesToNda: false,
    },
  });

  const createRegistration = useMutation({
    mutationFn: async (data: VendorRegistrationForm) => {
      const response = await apiRequest("POST", "/api/vendor-registrations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted!",
        description: "Thank you for registering. Our team will review your application and contact you soon.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraft = useMutation({
    mutationFn: async (data: VendorRegistrationForm) => {
      const response = await apiRequest("POST", "/api/vendor-registrations", {
        ...data,
        status: "draft",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRegistrationId(data.id);
      toast({ title: "Progress Saved", description: "Your information has been saved." });
    },
    onError: () => {
      toast({ title: "Save Failed", description: "Could not save progress.", variant: "destructive" });
    },
  });

  const handleFileUpload = async (docType: string, file: File) => {
    if (!registrationId) {
      const formData = form.getValues();
      const result = await saveDraft.mutateAsync(formData);
      if (!result?.id) return;
    }

    setUploadingDoc(docType);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch(`/api/vendor-registrations/${registrationId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const uploadResult = await response.json();

      const docResponse = await fetch(`/api/vendor-registrations/${registrationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: docType,
          documentName: file.name,
          fileUrl: uploadResult.fileUrl,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
        }),
      });

      if (!docResponse.ok) throw new Error("Failed to save document");

      setUploadedDocuments((prev) => [
        ...prev.filter((d) => d.documentType !== docType),
        { documentType: docType, documentName: file.name, fileUrl: uploadResult.fileUrl, fileSize: uploadResult.fileSize, mimeType: uploadResult.mimeType },
      ]);
      toast({ title: "Uploaded", description: `${documentTypeLabels[docType]} uploaded successfully.` });
    } catch {
      toast({ title: "Upload Failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleRemoveDocument = (docType: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.documentType !== docType));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    form.setValue("categories", updated);
  };

  const handleStateToggle = (state: string) => {
    const updated = selectedStates.includes(state)
      ? selectedStates.filter(s => s !== state)
      : [...selectedStates, state];
    setSelectedStates(updated);
    form.setValue("serviceStates", updated);
  };

  const nextStep = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const onSubmit = (data: VendorRegistrationForm) => createRegistration.mutate(data);

  const formatCategoryLabel = (category: string) => {
    return category.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-8 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4">
              <Shield className="w-4 h-4 text-[#d4af37]" />
              Secure & Verified Registration
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" data-testid="text-page-title">
              Become a {branding.company.name} Partner
            </h1>
            <p className="text-white/80 text-lg">
              Join our network of trusted vendors and access premium event opportunities
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer transition-all",
                    currentStep >= step.id ? "opacity-100" : "opacity-50"
                  )}
                  onClick={() => setCurrentStep(step.id)}
                  data-testid={`step-${step.id}`}
                >
                  <div className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep === step.id
                      ? "bg-[#601a29] text-white shadow-lg ring-4 ring-[#601a29]/20"
                      : currentStep > step.id
                      ? "bg-[#d4af37] text-white"
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4 md:w-5 md:h-5" />}
                  </div>
                  <div className="hidden md:block">
                    <p className={cn("text-sm font-medium", currentStep === step.id ? "text-[#601a29]" : "text-gray-600")}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "hidden lg:block w-16 xl:w-24 h-0.5 mx-2",
                      currentStep > step.id ? "bg-[#d4af37]" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#601a29] to-[#d4af37] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-[#601a29]/5 to-[#d4af37]/5 px-6 py-5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#601a29] to-[#7a2233] flex items-center justify-center shadow-lg">
                      {(() => {
                        const StepIcon = steps[currentStep - 1].icon;
                        return <StepIcon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
                      <p className="text-gray-500 text-sm">{steps[currentStep - 1].description}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 md:p-8">
                  {/* Step 1: Business Profile */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-gray-700">Business Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="businessName"
                            {...form.register("businessName")}
                            placeholder="Your registered business name"
                            className="h-11 border-gray-200 focus:border-[#601a29] focus:ring-[#601a29]"
                            data-testid="input-business-name"
                          />
                          {form.formState.errors.businessName && (
                            <p className="text-sm text-red-500">{form.formState.errors.businessName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brandName" className="text-gray-700">Brand/Trading Name</Label>
                          <Input
                            id="brandName"
                            {...form.register("brandName")}
                            placeholder="If different from business name"
                            className="h-11 border-gray-200"
                            data-testid="input-brand-name"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Entity Type <span className="text-red-500">*</span></Label>
                          <Select onValueChange={(value) => form.setValue("entityType", value as any)} defaultValue="proprietorship">
                            <SelectTrigger className="h-11" data-testid="select-entity-type">
                              <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="proprietorship">Proprietorship</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="llp">LLP</SelectItem>
                              <SelectItem value="private_limited">Private Limited</SelectItem>
                              <SelectItem value="public_limited">Public Limited</SelectItem>
                              <SelectItem value="trust">Trust</SelectItem>
                              <SelectItem value="society">Society</SelectItem>
                              <SelectItem value="huf">HUF</SelectItem>
                              <SelectItem value="individual">Individual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearEstablished" className="text-gray-700">Year Established</Label>
                          <Input
                            id="yearEstablished"
                            type="number"
                            {...form.register("yearEstablished", { valueAsNumber: true })}
                            placeholder="e.g., 2015"
                            className="h-11"
                            data-testid="input-year-established"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Team Size</Label>
                          <Select onValueChange={(value) => form.setValue("employeeCount", value)}>
                            <SelectTrigger className="h-11" data-testid="select-employee-count">
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                            <SelectContent>
                              {employeeCountOptions.map(option => (
                                <SelectItem key={option} value={option}>{option} employees</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">Annual Turnover</Label>
                          <Select onValueChange={(value) => form.setValue("annualTurnover", value)}>
                            <SelectTrigger className="h-11" data-testid="select-annual-turnover">
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under_10l">Under ₹10 Lakhs</SelectItem>
                              <SelectItem value="10l_25l">₹10-25 Lakhs</SelectItem>
                              <SelectItem value="25l_50l">₹25-50 Lakhs</SelectItem>
                              <SelectItem value="50l_1cr">₹50L - 1 Crore</SelectItem>
                              <SelectItem value="1cr_5cr">₹1-5 Crore</SelectItem>
                              <SelectItem value="above_10cr">Above ₹10 Crore</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#601a29]" />
                          Tax & Registration Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="panNumber" className="text-gray-700">PAN Number</Label>
                            <Input
                              id="panNumber"
                              {...form.register("panNumber")}
                              placeholder="ABCDE1234F"
                              className="h-11 uppercase"
                              data-testid="input-pan-number"
                            />
                            {form.formState.errors.panNumber && (
                              <p className="text-sm text-red-500">{form.formState.errors.panNumber.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gstNumber" className="text-gray-700">GST Number</Label>
                            <Input
                              id="gstNumber"
                              {...form.register("gstNumber")}
                              placeholder="22ABCDE1234F1Z5"
                              className="h-11 uppercase"
                              data-testid="input-gst-number"
                            />
                            {form.formState.errors.gstNumber && (
                              <p className="text-sm text-red-500">{form.formState.errors.gstNumber.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contact Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonName" className="text-gray-700">Contact Person <span className="text-red-500">*</span></Label>
                          <Input
                            id="contactPersonName"
                            {...form.register("contactPersonName")}
                            placeholder="Full name"
                            className="h-11"
                            data-testid="input-contact-name"
                          />
                          {form.formState.errors.contactPersonName && (
                            <p className="text-sm text-red-500">{form.formState.errors.contactPersonName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonDesignation" className="text-gray-700">Designation</Label>
                          <Input
                            id="contactPersonDesignation"
                            {...form.register("contactPersonDesignation")}
                            placeholder="e.g., Owner, Manager"
                            className="h-11"
                            data-testid="input-designation"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail" className="text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            {...form.register("contactEmail")}
                            placeholder="your@email.com"
                            className="h-11"
                            data-testid="input-email"
                          />
                          {form.formState.errors.contactEmail && (
                            <p className="text-sm text-red-500">{form.formState.errors.contactEmail.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone" className="text-gray-700 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contactPhone"
                            {...form.register("contactPhone")}
                            placeholder="+91 98765 43210"
                            className="h-11"
                            data-testid="input-phone"
                          />
                          {form.formState.errors.contactPhone && (
                            <p className="text-sm text-red-500">{form.formState.errors.contactPhone.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#601a29]" />
                          Business Address
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="registeredAddress" className="text-gray-700">Address</Label>
                            <Textarea
                              id="registeredAddress"
                              {...form.register("registeredAddress")}
                              placeholder="Full business address"
                              className="min-h-[80px]"
                              data-testid="input-address"
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="registeredCity" className="text-gray-700">City</Label>
                              <Input id="registeredCity" {...form.register("registeredCity")} placeholder="City" className="h-11" data-testid="input-city" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-700">State</Label>
                              <Select onValueChange={(value) => form.setValue("registeredState", value)}>
                                <SelectTrigger className="h-11" data-testid="select-state">
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                  {indianStates.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="registeredPincode" className="text-gray-700">Pincode</Label>
                              <Input id="registeredPincode" {...form.register("registeredPincode")} placeholder="6-digit" maxLength={6} className="h-11" data-testid="input-pincode" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#601a29]" />
                          Online Presence <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="websiteUrl" className="text-gray-700 flex items-center gap-2"><Globe className="w-3 h-3" /> Website</Label>
                            <Input id="websiteUrl" {...form.register("websiteUrl")} placeholder="https://yourwebsite.com" className="h-11" data-testid="input-website" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instagramUrl" className="text-gray-700 flex items-center gap-2"><Instagram className="w-3 h-3" /> Instagram</Label>
                            <Input id="instagramUrl" {...form.register("instagramUrl")} placeholder="@yourhandle" className="h-11" data-testid="input-instagram" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Services & Coverage */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-gray-700 text-base font-semibold">Service Categories <span className="text-red-500">*</span></Label>
                        <p className="text-sm text-gray-500 mb-4">Select all categories that apply to your services</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {vendorCategories.map(category => (
                            <div
                              key={category}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                selectedCategories.includes(category)
                                  ? "border-[#601a29] bg-[#601a29]/5 shadow-sm"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              )}
                              onClick={() => handleCategoryToggle(category)}
                              data-testid={`category-${category}`}
                            >
                              <Checkbox checked={selectedCategories.includes(category)} className="data-[state=checked]:bg-[#601a29] data-[state=checked]:border-[#601a29]" />
                              <span className="text-sm font-medium text-gray-700">{formatCategoryLabel(category)}</span>
                            </div>
                          ))}
                        </div>
                        {form.formState.errors.categories && (
                          <p className="text-sm text-red-500 mt-2">{form.formState.errors.categories.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serviceDescription" className="text-gray-700">Describe Your Services</Label>
                        <Textarea
                          id="serviceDescription"
                          {...form.register("serviceDescription")}
                          placeholder="Tell us about what makes your services special..."
                          className="min-h-[120px]"
                          data-testid="input-service-description"
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-800 mb-4">Service Coverage</h3>
                        <div className="flex items-center gap-3 p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/30 mb-4">
                          <Checkbox
                            checked={form.watch("panIndiaService")}
                            onCheckedChange={(checked) => form.setValue("panIndiaService", checked as boolean)}
                            className="data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                            data-testid="checkbox-pan-india-service"
                          />
                          <div>
                            <span className="font-medium text-gray-800">Pan-India Service</span>
                            <p className="text-sm text-gray-600">We can serve clients anywhere in India</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">Or select specific states:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border rounded-xl bg-gray-50">
                          {indianStates.map(state => (
                            <div
                              key={state}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all",
                                selectedStates.includes(state)
                                  ? "bg-[#601a29] text-white"
                                  : "hover:bg-gray-200"
                              )}
                              onClick={() => handleStateToggle(state)}
                              data-testid={`chip-state-${state.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <span>{state}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-5 pt-4 border-t">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Pricing Tier</Label>
                          <Select onValueChange={(value) => form.setValue("pricingTier", value)}>
                            <SelectTrigger className="h-11" data-testid="select-pricing-tier">
                              <SelectValue placeholder="Select your pricing tier" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="budget">Budget-Friendly</SelectItem>
                              <SelectItem value="mid_range">Mid-Range</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minimumBudget" className="text-gray-700">Minimum Project Value (₹)</Label>
                          <Input
                            id="minimumBudget"
                            type="number"
                            {...form.register("minimumBudget", { valueAsNumber: true })}
                            placeholder="e.g., 50000"
                            className="h-11"
                            data-testid="input-minimum-budget"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Complete Registration */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#601a29]/5 to-[#d4af37]/5 rounded-xl p-6 border border-[#601a29]/10">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Upload className="w-5 h-5 text-[#601a29]" />
                          Upload Documents <span className="text-gray-400 text-sm font-normal">(Optional but recommended)</span>
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(documentTypeLabels).map(([docType, label]) => {
                            const uploadedDoc = uploadedDocuments.find(d => d.documentType === docType);
                            const isUploading = uploadingDoc === docType;
                            return (
                              <div key={docType} className="bg-white border rounded-xl p-4" data-testid={`doc-upload-${docType}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium text-sm text-gray-700">{label}</span>
                                </div>
                                {uploadedDoc ? (
                                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <File className="w-4 h-4 text-green-600" />
                                      <div>
                                        <p className="text-sm font-medium text-green-700 truncate max-w-[120px]">{uploadedDoc.documentName}</p>
                                        <p className="text-xs text-green-600">{formatFileSize(uploadedDoc.fileSize)}</p>
                                      </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDocument(docType)} data-testid={`button-remove-${docType}`}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#601a29] hover:bg-[#601a29]/5 transition-all">
                                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-[#601a29]" /> : <Upload className="w-5 h-5 text-gray-400" />}
                                    <span className="text-sm text-gray-500">{isUploading ? "Uploading..." : "Click to upload"}</span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(docType, file); }}
                                      disabled={isUploading}
                                    />
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#601a29]" />
                          Declarations
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-4 border rounded-xl bg-gray-50">
                            <Checkbox
                              checked={form.watch("hasNoPendingLitigation")}
                              onCheckedChange={(checked) => form.setValue("hasNoPendingLitigation", checked as boolean)}
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-gray-700">No Pending Litigation</span>
                              <p className="text-sm text-gray-500">I confirm there are no pending legal cases against the business</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 border rounded-xl bg-gray-50">
                            <Checkbox
                              checked={form.watch("hasNeverBlacklisted")}
                              onCheckedChange={(checked) => form.setValue("hasNeverBlacklisted", checked as boolean)}
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-gray-700">Never Blacklisted</span>
                              <p className="text-sm text-gray-500">I confirm the business has never been blacklisted by any organization</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3 p-4 border-2 border-[#601a29]/20 rounded-xl bg-[#601a29]/5">
                          <Checkbox
                            checked={form.watch("agreesToTerms")}
                            onCheckedChange={(checked) => form.setValue("agreesToTerms", checked as boolean)}
                            className="mt-0.5 data-[state=checked]:bg-[#601a29] data-[state=checked]:border-[#601a29]"
                            data-testid="checkbox-terms"
                          />
                          <div>
                            <span className="font-medium text-gray-800">I agree to the Terms & Conditions <span className="text-red-500">*</span></span>
                            <p className="text-sm text-gray-600">By submitting, I agree to the vendor partnership terms and privacy policy</p>
                          </div>
                        </div>
                        {form.formState.errors.agreesToTerms && (
                          <p className="text-sm text-red-500 mt-2">{form.formState.errors.agreesToTerms.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Navigation */}
                <div className="px-6 md:px-8 py-5 bg-gray-50 border-t flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="gap-2"
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="gap-2 bg-[#601a29] hover:bg-[#4a1320]"
                        data-testid="button-next"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createRegistration.isPending}
                        className="gap-2 bg-gradient-to-r from-[#601a29] to-[#d4af37] hover:from-[#4a1320] hover:to-[#c5a030] min-w-[180px]"
                        data-testid="button-submit"
                      >
                        {createRegistration.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Submit Registration
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </form>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#d4af37]" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
              <span>Verified Partners Only</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Premium Network</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
