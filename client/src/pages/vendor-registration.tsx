import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  Building2, User, Briefcase, CheckCircle2, 
  ChevronLeft, ChevronRight, Loader2, Upload, X, File, Shield, Sparkles,
  Phone, Mail, MapPin, ArrowLeft, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

const STORAGE_KEY = "vendor_registration_progress";

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
  categories: z.array(z.string()).optional().default([]),
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
  agreesToTerms: z.boolean().refine((val) => val === true, { message: "You must agree to the Terms & Conditions to proceed" }),
  agreesToNda: z.boolean().optional(),
});

type VendorRegistrationForm = z.infer<typeof vendorRegistrationSchema>;

const steps = [
  { id: 1, title: "Business", icon: Building2 },
  { id: 2, title: "Contact", icon: User },
  { id: 3, title: "Services", icon: Briefcase },
  { id: 4, title: "Submit", icon: CheckCircle2 },
];

interface UploadedDocument {
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface SavedProgress {
  formData: Partial<VendorRegistrationForm>;
  currentStep: number;
  selectedCategories: string[];
  selectedStates: string[];
  savedAt: string;
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
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { branding } = useBranding();

  const { data: vendorCategories = [] } = useQuery<string[]>({
    queryKey: ["/api/vendor-categories"],
  });

  const form = useForm<VendorRegistrationForm>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      entityType: "sole_proprietor",
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

  const saveProgressToStorage = useCallback(() => {
    try {
      const formData = form.getValues();
      const progress: SavedProgress = {
        formData,
        currentStep,
        selectedCategories,
        selectedStates,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, [form, currentStep, selectedCategories, selectedStates]);

  useEffect(() => {
    if (!hasRestoredProgress) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const progress: SavedProgress = JSON.parse(saved);
          Object.entries(progress.formData).forEach(([key, value]) => {
            if (value !== undefined) {
              form.setValue(key as keyof VendorRegistrationForm, value as any);
            }
          });
          setCurrentStep(progress.currentStep);
          setSelectedCategories(progress.selectedCategories || []);
          setSelectedStates(progress.selectedStates || []);
          setLastSaved(new Date(progress.savedAt).toLocaleTimeString());
          toast({
            title: "Progress Restored",
            description: "Your previous form data has been restored.",
          });
        }
      } catch (error) {
        console.error("Failed to restore progress:", error);
      }
      setHasRestoredProgress(true);
    }
  }, [hasRestoredProgress, form, toast]);

  useEffect(() => {
    if (!hasRestoredProgress) return;
    
    const subscription = form.watch((data) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgressToStorage();
      }, 2000);
    });
    
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasRestoredProgress, saveProgressToStorage]);

  useEffect(() => {
    if (hasRestoredProgress) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveProgressToStorage();
      }, 500);
    }
  }, [currentStep, selectedCategories, selectedStates, hasRestoredProgress, saveProgressToStorage]);

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLastSaved(null);
  };

  const createRegistration = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/vendor-registrations", data);
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors
            .map((err: any) => `${err.path?.join('.') || 'Field'}: ${err.message}`)
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(errorData.message || "Registration failed. Please check your details.");
      }
      return response.json();
    },
    onSuccess: () => {
      clearProgress();
      toast({
        title: "Registration Submitted!",
        description: "Thank you for registering. Our team will review your application and contact you soon.",
      });
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
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
    const currentCategories = form.watch("categories") || [];
    const updated = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    form.setValue("categories", updated);
    setSelectedCategories(updated);
  };

  const handleStateToggle = (state: string) => {
    const currentStates = form.watch("serviceStates") || [];
    const updated = currentStates.includes(state)
      ? currentStates.filter(s => s !== state)
      : [...currentStates, state];
    form.setValue("serviceStates", updated);
    setSelectedStates(updated);
  };

  const nextStep = () => {
    saveProgressToStorage();
    currentStep < steps.length && setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    saveProgressToStorage();
    currentStep > 1 && setCurrentStep(currentStep - 1);
  };
  const onSubmit = async (data: VendorRegistrationForm) => {
    try {
      // Clean and validate data before submission
      const cleanedData = cleanFormData(data);
      createRegistration.mutate(cleanedData);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCategoryLabel = (category: string) => {
    return category.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  // Smart PAN formatting: ABCDE1234F
  const formatPAN = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length > 10) return cleaned.slice(0, 10);
    return cleaned;
  };

  // Smart GST formatting: 22ABCDE1234F1Z5
  const formatGST = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length > 15) return cleaned.slice(0, 15);
    return cleaned;
  };

  // Clean data before submission (remove undefined/empty values)
  const cleanFormData = (data: VendorRegistrationForm) => {
    // Validate required fields FIRST
    if (!data.businessName?.trim()) throw new Error("Business name is required");
    if (!data.entityType || data.entityType === '') throw new Error("Entity type is required");
    if (!data.contactPersonName?.trim()) throw new Error("Contact person name is required");
    if (!data.contactEmail?.trim()) throw new Error("Contact email is required");
    if (!data.contactPhone?.trim()) throw new Error("Contact phone is required");
    if (!data.agreesToTerms) throw new Error("You must agree to Terms & Conditions");

    const cleaned: any = { ...data };
    
    // Clean up empty strings and empty arrays (but keep entityType and other required fields)
    Object.keys(cleaned).forEach(key => {
      if (key === 'entityType' || key === 'businessName' || key === 'contactPersonName' || 
          key === 'contactEmail' || key === 'contactPhone' || key === 'agreesToTerms') {
        // Never delete required fields
        return;
      }
      
      if (cleaned[key] === '' || (Array.isArray(cleaned[key]) && cleaned[key].length === 0)) {
        delete cleaned[key];
      }
    });

    return cleaned;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-gradient-to-r from-[#601a29] to-[#7a2233] text-white px-3 sm:px-4 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div>
              <h1 className="text-base sm:text-lg font-bold" data-testid="text-page-title">Partner Registration</h1>
              <p className="text-xs text-white/70">Join {branding.company.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
                    currentStep === step.id
                      ? "bg-white text-[#601a29]"
                      : currentStep > step.id
                      ? "bg-[#d4af37] text-white"
                      : "bg-white/10 text-white/60"
                  )}
                  data-testid={`step-${step.id}`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <step.icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden xs:inline sm:inline">{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-3 sm:w-4 h-0.5 mx-0.5",
                    currentStep > step.id ? "bg-[#d4af37]" : "bg-white/20"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {lastSaved && (
        <div className="bg-green-50 border-b border-green-100 px-3 sm:px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <Save className="w-3.5 h-3.5" />
              <span>Progress auto-saved at {lastSaved}</span>
            </div>
            <button
              onClick={() => {
                clearProgress();
                form.reset();
                setCurrentStep(1);
                setSelectedCategories([]);
                setSelectedStates([]);
                toast({ title: "Progress cleared", description: "Form has been reset." });
              }}
              className="text-green-600 hover:text-green-800 underline"
              data-testid="button-clear-progress"
            >
              Clear & Start Over
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <Card className="shadow-lg border-0 flex flex-col overflow-hidden">
                  <CardContent className="p-4 sm:p-5 overflow-auto">
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="businessName" className="text-sm">Business Name <span className="text-red-500">*</span></Label>
                            <Input
                              id="businessName"
                              {...form.register("businessName")}
                              placeholder="Your registered business name"
                              className="h-10 sm:h-9"
                              data-testid="input-business-name"
                            />
                            {form.formState.errors.businessName && (
                              <p className="text-xs text-red-500">{form.formState.errors.businessName.message}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="brandName" className="text-sm">Brand Name</Label>
                            <Input
                              id="brandName"
                              {...form.register("brandName")}
                              placeholder="If different from business name"
                              className="h-10 sm:h-9"
                              data-testid="input-brand-name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm">Entity Type <span className="text-red-500">*</span></Label>
                            <Select 
                              value={form.watch("entityType") || "sole_proprietor"}
                              onValueChange={(value) => form.setValue("entityType", value as any)}
                            >
                              <SelectTrigger className="h-10 sm:h-9" data-testid="select-entity-type">
                                <SelectValue placeholder="Select entity type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="llp">LLP</SelectItem>
                                <SelectItem value="opc">One Person Company (OPC)</SelectItem>
                                <SelectItem value="private_limited">Pvt Ltd</SelectItem>
                                <SelectItem value="public_limited">Public Ltd</SelectItem>
                                <SelectItem value="huf">HUF</SelectItem>
                                <SelectItem value="trust">Trust</SelectItem>
                                <SelectItem value="society">Society</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm">Year Established</Label>
                            <Input
                              type="number"
                              {...form.register("yearEstablished", { valueAsNumber: true })}
                              placeholder="e.g., 2015"
                              className="h-10 sm:h-9"
                              data-testid="input-year-established"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm">Team Size</Label>
                            <Select onValueChange={(value) => form.setValue("employeeCount", value)}>
                              <SelectTrigger className="h-10 sm:h-9" data-testid="select-employee-count">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {employeeCountOptions.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm">Annual Turnover</Label>
                            <Select onValueChange={(value) => form.setValue("annualTurnover", value)}>
                              <SelectTrigger className="h-10 sm:h-9" data-testid="select-annual-turnover">
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

                        <div className="pt-3 border-t">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#601a29]" />
                            Tax & Registration
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-sm">PAN Number <span className="text-gray-400 text-xs">(Auto-formatted)</span></Label>
                              <Input
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                className="h-10 sm:h-9 uppercase"
                                data-testid="input-pan-number"
                                value={form.watch("panNumber") || ""}
                                onChange={(e) => {
                                  const formatted = formatPAN(e.target.value);
                                  form.setValue("panNumber", formatted);
                                }}
                              />
                              {form.formState.errors.panNumber && (
                                <p className="text-xs text-red-500">{form.formState.errors.panNumber.message}</p>
                              )}
                              {form.watch("panNumber") && form.watch("panNumber")!.length === 10 && (
                                <p className="text-xs text-green-600">✓ Valid PAN format</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm">GST Number <span className="text-gray-400 text-xs">(Auto-formatted)</span></Label>
                              <Input
                                placeholder="22ABCDE1234F1Z5"
                                maxLength={15}
                                className="h-10 sm:h-9 uppercase"
                                data-testid="input-gst-number"
                                value={form.watch("gstNumber") || ""}
                                onChange={(e) => {
                                  const formatted = formatGST(e.target.value);
                                  form.setValue("gstNumber", formatted);
                                }}
                              />
                              {form.formState.errors.gstNumber && (
                                <p className="text-xs text-red-500">{form.formState.errors.gstNumber.message}</p>
                              )}
                              {form.watch("gstNumber") && form.watch("gstNumber")!.length === 15 && (
                                <p className="text-xs text-green-600">✓ Valid GST format</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm">Contact Person <span className="text-red-500">*</span></Label>
                            <Input
                              {...form.register("contactPersonName")}
                              placeholder="Full name"
                              className="h-10 sm:h-9"
                              data-testid="input-contact-name"
                            />
                            {form.formState.errors.contactPersonName && (
                              <p className="text-xs text-red-500">{form.formState.errors.contactPersonName.message}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm">Designation</Label>
                            <Input
                              {...form.register("contactPersonDesignation")}
                              placeholder="e.g., Owner, Manager"
                              className="h-10 sm:h-9"
                              data-testid="input-designation"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" /> Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="email"
                              {...form.register("contactEmail")}
                              placeholder="your@email.com"
                              className="h-10 sm:h-9"
                              data-testid="input-email"
                            />
                            {form.formState.errors.contactEmail && (
                              <p className="text-xs text-red-500">{form.formState.errors.contactEmail.message}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" /> Phone <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              {...form.register("contactPhone")}
                              placeholder="+91 98765 43210"
                              className="h-10 sm:h-9"
                              data-testid="input-phone"
                            />
                            {form.formState.errors.contactPhone && (
                              <p className="text-xs text-red-500">{form.formState.errors.contactPhone.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#601a29]" />
                            Business Address
                          </h3>
                          <div className="space-y-3">
                            <Input
                              {...form.register("registeredAddress")}
                              placeholder="Full business address"
                              className="h-10 sm:h-9"
                              data-testid="input-address"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input 
                                {...form.register("registeredCity")} 
                                placeholder="City" 
                                className="h-10 sm:h-9" 
                                data-testid="input-city" 
                              />
                              <Select onValueChange={(value) => form.setValue("registeredState", value)}>
                                <SelectTrigger className="h-10 sm:h-9" data-testid="select-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {indianStates.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input 
                                {...form.register("registeredPincode")} 
                                placeholder="Pincode" 
                                maxLength={6} 
                                className="h-10 sm:h-9" 
                                data-testid="input-pincode" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3">Online Presence <span className="text-gray-400 font-normal">(Optional)</span></h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input {...form.register("websiteUrl")} placeholder="Website URL" className="h-10 sm:h-9" data-testid="input-website" />
                            <Input {...form.register("instagramUrl")} placeholder="@instagram" className="h-10 sm:h-9" data-testid="input-instagram" />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold mb-3 block">Service Categories <span className="text-red-500">*</span></Label>
                          <p className="text-xs text-gray-600 mb-3">Select all services you provide (click to toggle)</p>
                          <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            {vendorCategories.length > 0 ? (
                              vendorCategories.map(category => {
                                const currentCategories = form.watch("categories") || [];
                                const isSelected = currentCategories.includes(category);
                                return (
                                  <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleCategoryToggle(category)}
                                    className={cn(
                                      "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2",
                                      isSelected
                                        ? "bg-[#601a29] text-white border-[#601a29] shadow-md scale-105"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-[#601a29] hover:text-[#601a29]"
                                    )}
                                    data-testid={`category-${category}`}
                                  >
                                    {formatCategoryLabel(category)}
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500 w-full text-center py-4">Loading categories...</p>
                            )}
                          </div>
                          {form.formState.errors.categories && (
                            <p className="text-xs text-red-500 mt-2">{form.formState.errors.categories.message}</p>
                          )}
                          {form.watch("categories")?.length > 0 && (
                            <p className="text-xs text-green-600 mt-2">✓ {form.watch("categories")?.length} category/categories selected</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-sm">Service Description</Label>
                          <Textarea
                            {...form.register("serviceDescription")}
                            placeholder="What makes your services special..."
                            className="min-h-[80px] sm:min-h-[60px] resize-none"
                            data-testid="input-service-description"
                          />
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <Label className="text-sm font-semibold">Service Coverage <span className="text-red-500">*</span></Label>
                            <label className="flex items-center gap-2 px-3 py-1.5 bg-[#d4af37]/10 rounded-full cursor-pointer hover:bg-[#d4af37]/20 transition-colors w-fit">
                              <Checkbox
                                checked={form.watch("panIndiaService")}
                                onCheckedChange={(checked) => form.setValue("panIndiaService", checked as boolean)}
                                className="w-4 h-4 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                                data-testid="checkbox-pan-india-service"
                              />
                              <span className="text-sm font-medium text-gray-700">Pan-India Service</span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">Select all states where you provide service (click to toggle)</p>
                          <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            {indianStates.map(state => {
                              const currentStates = form.watch("serviceStates") || [];
                              const isSelected = currentStates.includes(state);
                              return (
                                <button
                                  key={state}
                                  type="button"
                                  onClick={() => handleStateToggle(state)}
                                  className={cn(
                                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap",
                                    isSelected
                                      ? "bg-[#601a29] text-white border-[#601a29] shadow-md scale-105"
                                      : "bg-white text-gray-700 border-gray-300 hover:border-[#601a29] hover:text-[#601a29]"
                                  )}
                                  data-testid={`state-${state.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {state}
                                </button>
                              );
                            })}
                          </div>
                          {form.formState.errors.serviceStates && (
                            <p className="text-xs text-red-500 mt-2">{form.formState.errors.serviceStates.message}</p>
                          )}
                          {(form.watch("serviceStates")?.length ?? 0) > 0 && (
                            <p className="text-xs text-green-600 mt-2">✓ {form.watch("serviceStates")?.length} state/states selected</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                          <div className="space-y-1.5">
                            <Label className="text-sm">Pricing Tier</Label>
                            <Select onValueChange={(value) => form.setValue("pricingTier", value)}>
                              <SelectTrigger className="h-10 sm:h-9" data-testid="select-pricing-tier">
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="budget">Budget-Friendly</SelectItem>
                                <SelectItem value="mid_range">Mid-Range</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="luxury">Luxury</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-sm">Min. Project Value (₹)</Label>
                            <Input
                              type="number"
                              {...form.register("minimumBudget", { valueAsNumber: true })}
                              placeholder="e.g., 50000"
                              className="h-10 sm:h-9"
                              data-testid="input-minimum-budget"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-[#601a29]/5 to-[#d4af37]/5 rounded-lg p-3 sm:p-4 border border-[#601a29]/10">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-[#601a29]" />
                            Documents <span className="text-gray-400 font-normal">(Optional)</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(documentTypeLabels).map(([docType, label]) => {
                              const uploadedDoc = uploadedDocuments.find(d => d.documentType === docType);
                              const isUploading = uploadingDoc === docType;
                              return (
                                <div key={docType} className="bg-white border rounded-lg p-3" data-testid={`doc-upload-${docType}`}>
                                  <span className="text-xs font-medium text-gray-600 block mb-2">{label}</span>
                                  {uploadedDoc ? (
                                    <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <File className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                        <span className="text-xs text-green-700 truncate">{uploadedDoc.documentName}</span>
                                      </div>
                                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveDocument(docType)} data-testid={`button-remove-${docType}`}>
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded cursor-pointer hover:border-[#601a29] hover:bg-[#601a29]/5 transition-all">
                                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-[#601a29]" /> : <Upload className="w-4 h-4 text-gray-400" />}
                                      <span className="text-xs text-gray-500">{isUploading ? "Uploading..." : "Upload"}</span>
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

                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#601a29]" />
                            Declarations
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                              <Checkbox
                                checked={form.watch("hasNoPendingLitigation")}
                                onCheckedChange={(checked) => form.setValue("hasNoPendingLitigation", checked as boolean)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">No Pending Litigation</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                              <Checkbox
                                checked={form.watch("hasNeverBlacklisted")}
                                onCheckedChange={(checked) => form.setValue("hasNeverBlacklisted", checked as boolean)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Never Blacklisted</span>
                            </label>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <label className="flex items-start gap-3 p-3 sm:p-4 border-2 border-[#601a29]/20 rounded-lg bg-[#601a29]/5 cursor-pointer hover:bg-[#601a29]/10 transition-colors">
                            <Checkbox
                              checked={form.watch("agreesToTerms")}
                              onCheckedChange={(checked) => form.setValue("agreesToTerms", checked as boolean)}
                              className="mt-0.5 data-[state=checked]:bg-[#601a29] data-[state=checked]:border-[#601a29]"
                              data-testid="checkbox-terms"
                            />
                            <div>
                              <span className="font-medium text-sm text-gray-800">I agree to the Terms & Conditions <span className="text-red-500">*</span></span>
                              <p className="text-xs text-gray-600">By submitting, I agree to the vendor partnership terms and privacy policy</p>
                            </div>
                          </label>
                          {form.formState.errors.agreesToTerms && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.agreesToTerms.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 border-t flex items-center justify-between flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="gap-1 sm:gap-1.5 h-10 sm:h-9 text-sm"
                      data-testid="button-prev"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden xs:inline">Back</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {steps.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            currentStep === idx + 1
                              ? "bg-[#601a29] w-4"
                              : currentStep > idx + 1
                              ? "bg-[#d4af37]"
                              : "bg-gray-300"
                          )}
                        />
                      ))}
                    </div>

                    {currentStep < steps.length ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="gap-1 sm:gap-1.5 h-10 sm:h-9 bg-[#601a29] hover:bg-[#4a1320] text-sm"
                        data-testid="button-next"
                      >
                        <span className="hidden xs:inline">Continue</span>
                        <span className="xs:hidden">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={createRegistration.isPending}
                        className="gap-1 sm:gap-1.5 h-10 sm:h-9 bg-gradient-to-r from-[#601a29] to-[#d4af37] hover:from-[#4a1320] hover:to-[#c5a030] min-w-[100px] sm:min-w-[140px] text-sm"
                        data-testid="button-submit"
                      >
                        {createRegistration.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
