import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, User, MapPin, Briefcase, CreditCard, FileText, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/footer";

const businessEntityTypes = [
  "proprietorship",
  "partnership", 
  "llp",
  "private_limited",
  "public_limited",
  "trust",
  "society",
  "huf",
  "individual"
] as const;

const employeeCountOptions = [
  "1-5",
  "6-10", 
  "11-25",
  "26-50",
  "51-100",
  "100+"
];

const annualTurnoverOptions = [
  "under_10l",
  "10l_25l",
  "25l_50l",
  "50l_1cr",
  "1cr_5cr",
  "5cr_10cr",
  "above_10cr"
];

const pricingTierOptions = [
  "budget",
  "mid_range",
  "premium",
  "luxury"
];

const paymentTermsOptions = [
  "advance_full",
  "50_50",
  "30_40_30",
  "on_completion",
  "custom"
];

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
  { id: 1, title: "Business Info", icon: Building2, description: "Company details" },
  { id: 2, title: "Contact", icon: User, description: "Contact information" },
  { id: 3, title: "Address", icon: MapPin, description: "Location details" },
  { id: 4, title: "Services", icon: Briefcase, description: "Your offerings" },
  { id: 5, title: "Payment", icon: CreditCard, description: "Banking details" },
  { id: 6, title: "Documents", icon: FileText, description: "Compliance" },
  { id: 7, title: "Review", icon: CheckCircle2, description: "Final check" },
];

export default function VendorRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [, navigate] = useLocation();
  const { toast } = useToast();

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
        title: "Registration Submitted",
        description: "Your vendor registration has been submitted successfully. We will review and get back to you soon.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: VendorRegistrationForm) => {
    createRegistration.mutate(data);
  };

  const formatCategoryLabel = (category: string) => {
    return category
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2" data-testid="text-page-title">
              Vendor Registration
            </h1>
            <p className="text-slate-600">
              Partner with us to serve premium events across India
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex flex-col items-center cursor-pointer",
                      currentStep === step.id && "scale-105"
                    )}
                    onClick={() => setCurrentStep(step.id)}
                    data-testid={`step-${step.id}`}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        currentStep === step.id
                          ? "bg-amber-500 text-white shadow-lg"
                          : currentStep > step.id
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      )}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1 font-medium text-slate-600 hidden md:block">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2",
                        currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          {...form.register("businessName")}
                          placeholder="Your registered business name"
                          data-testid="input-business-name"
                        />
                        {form.formState.errors.businessName && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.businessName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="brandName">Brand Name (if different)</Label>
                        <Input
                          id="brandName"
                          {...form.register("brandName")}
                          placeholder="Trading or brand name"
                          data-testid="input-brand-name"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entityType">Entity Type *</Label>
                        <Select
                          onValueChange={(value) => form.setValue("entityType", value as any)}
                          defaultValue={form.getValues("entityType")}
                        >
                          <SelectTrigger data-testid="select-entity-type">
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
                      <div>
                        <Label htmlFor="yearEstablished">Year Established</Label>
                        <Input
                          id="yearEstablished"
                          type="number"
                          {...form.register("yearEstablished", { valueAsNumber: true })}
                          placeholder="e.g., 2015"
                          data-testid="input-year-established"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employeeCount">Employee Count</Label>
                        <Select onValueChange={(value) => form.setValue("employeeCount", value)}>
                          <SelectTrigger data-testid="select-employee-count">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            {employeeCountOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="annualTurnover">Annual Turnover</Label>
                        <Select onValueChange={(value) => form.setValue("annualTurnover", value)}>
                          <SelectTrigger data-testid="select-annual-turnover">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under_10l">Under ₹10 Lakhs</SelectItem>
                            <SelectItem value="10l_25l">₹10-25 Lakhs</SelectItem>
                            <SelectItem value="25l_50l">₹25-50 Lakhs</SelectItem>
                            <SelectItem value="50l_1cr">₹50L - 1 Crore</SelectItem>
                            <SelectItem value="1cr_5cr">₹1-5 Crore</SelectItem>
                            <SelectItem value="5cr_10cr">₹5-10 Crore</SelectItem>
                            <SelectItem value="above_10cr">Above ₹10 Crore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input
                          id="panNumber"
                          {...form.register("panNumber")}
                          placeholder="ABCDE1234F"
                          className="uppercase"
                          data-testid="input-pan-number"
                        />
                        {form.formState.errors.panNumber && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.panNumber.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          {...form.register("gstNumber")}
                          placeholder="22ABCDE1234F1Z5"
                          className="uppercase"
                          data-testid="input-gst-number"
                        />
                        {form.formState.errors.gstNumber && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.gstNumber.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="msmeNumber">MSME/Udyam Number</Label>
                        <Input
                          id="msmeNumber"
                          {...form.register("msmeNumber")}
                          placeholder="UDYAM-XX-00-0000000"
                          data-testid="input-msme-number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fssaiNumber">FSSAI License (for caterers)</Label>
                        <Input
                          id="fssaiNumber"
                          {...form.register("fssaiNumber")}
                          placeholder="FSSAI license number"
                          data-testid="input-fssai-number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700">Primary Contact</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactPersonName">Contact Person Name *</Label>
                        <Input
                          id="contactPersonName"
                          {...form.register("contactPersonName")}
                          placeholder="Full name"
                          data-testid="input-contact-name"
                        />
                        {form.formState.errors.contactPersonName && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactPersonName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contactPersonDesignation">Designation</Label>
                        <Input
                          id="contactPersonDesignation"
                          {...form.register("contactPersonDesignation")}
                          placeholder="e.g., Owner, Manager"
                          data-testid="input-contact-designation"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          {...form.register("contactEmail")}
                          placeholder="business@example.com"
                          data-testid="input-contact-email"
                        />
                        {form.formState.errors.contactEmail && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactEmail.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Phone *</Label>
                        <Input
                          id="contactPhone"
                          {...form.register("contactPhone")}
                          placeholder="+91 98765 43210"
                          data-testid="input-contact-phone"
                        />
                        {form.formState.errors.contactPhone && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactPhone.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="contactWhatsapp">WhatsApp Number</Label>
                      <Input
                        id="contactWhatsapp"
                        {...form.register("contactWhatsapp")}
                        placeholder="+91 98765 43210"
                        data-testid="input-contact-whatsapp"
                      />
                    </div>

                    <h3 className="font-semibold text-slate-700 pt-4">Secondary Contact (Optional)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="secondaryContactName">Name</Label>
                        <Input
                          id="secondaryContactName"
                          {...form.register("secondaryContactName")}
                          placeholder="Alternate contact name"
                          data-testid="input-secondary-contact-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondaryContactPhone">Phone</Label>
                        <Input
                          id="secondaryContactPhone"
                          {...form.register("secondaryContactPhone")}
                          placeholder="+91 98765 43210"
                          data-testid="input-secondary-contact-phone"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700">Registered Address</h3>
                    <div>
                      <Label htmlFor="registeredAddress">Address</Label>
                      <Textarea
                        id="registeredAddress"
                        {...form.register("registeredAddress")}
                        placeholder="Full registered address"
                        data-testid="input-registered-address"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="registeredCity">City</Label>
                        <Input
                          id="registeredCity"
                          {...form.register("registeredCity")}
                          placeholder="City"
                          data-testid="input-registered-city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="registeredState">State</Label>
                        <Select onValueChange={(value) => form.setValue("registeredState", value)}>
                          <SelectTrigger data-testid="select-registered-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="registeredPincode">Pincode</Label>
                        <Input
                          id="registeredPincode"
                          {...form.register("registeredPincode")}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          data-testid="input-registered-pincode"
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-700 pt-4">Operational Address (if different)</h3>
                    <div>
                      <Label htmlFor="operationalAddress">Address</Label>
                      <Textarea
                        id="operationalAddress"
                        {...form.register("operationalAddress")}
                        placeholder="Full operational address"
                        data-testid="input-operational-address"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="operationalCity">City</Label>
                        <Input
                          id="operationalCity"
                          {...form.register("operationalCity")}
                          placeholder="City"
                          data-testid="input-operational-city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="operationalState">State</Label>
                        <Select onValueChange={(value) => form.setValue("operationalState", value)}>
                          <SelectTrigger data-testid="select-operational-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="operationalPincode">Pincode</Label>
                        <Input
                          id="operationalPincode"
                          {...form.register("operationalPincode")}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          data-testid="input-operational-pincode"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">Service Categories *</Label>
                      <p className="text-sm text-slate-500 mb-3">Select all categories that apply to your services</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {vendorCategories.map(category => (
                          <div
                            key={category}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                              selectedCategories.includes(category)
                                ? "border-amber-500 bg-amber-50"
                                : "border-slate-200 hover:border-slate-300"
                            )}
                            onClick={() => handleCategoryToggle(category)}
                            data-testid={`category-${category}`}
                          >
                            <Checkbox checked={selectedCategories.includes(category)} />
                            <span className="text-sm">{formatCategoryLabel(category)}</span>
                          </div>
                        ))}
                      </div>
                      {form.formState.errors.categories && (
                        <p className="text-sm text-red-500 mt-2">{form.formState.errors.categories.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="serviceDescription">Service Description</Label>
                      <Textarea
                        id="serviceDescription"
                        {...form.register("serviceDescription")}
                        placeholder="Describe your services in detail..."
                        className="min-h-[100px]"
                        data-testid="input-service-description"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minimumGuestCapacity">Minimum Guest Capacity</Label>
                        <Input
                          id="minimumGuestCapacity"
                          type="number"
                          {...form.register("minimumGuestCapacity", { valueAsNumber: true })}
                          placeholder="e.g., 50"
                          data-testid="input-min-guest-capacity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maximumGuestCapacity">Maximum Guest Capacity</Label>
                        <Input
                          id="maximumGuestCapacity"
                          type="number"
                          {...form.register("maximumGuestCapacity", { valueAsNumber: true })}
                          placeholder="e.g., 5000"
                          data-testid="input-max-guest-capacity"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eventsPerMonth">Events Per Month</Label>
                        <Input
                          id="eventsPerMonth"
                          type="number"
                          {...form.register("eventsPerMonth", { valueAsNumber: true })}
                          placeholder="Average monthly events"
                          data-testid="input-events-per-month"
                        />
                      </div>
                      <div>
                        <Label htmlFor="staffStrength">Staff Strength</Label>
                        <Input
                          id="staffStrength"
                          type="number"
                          {...form.register("staffStrength", { valueAsNumber: true })}
                          placeholder="Number of staff"
                          data-testid="input-staff-strength"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold">Service States</Label>
                      <p className="text-sm text-slate-500 mb-3">Select states where you provide services</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Checkbox
                          checked={form.watch("panIndiaService")}
                          onCheckedChange={(checked) => form.setValue("panIndiaService", checked as boolean)}
                        />
                        <span className="text-sm font-medium">Pan-India Service Available</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {indianStates.map(state => (
                          <div
                            key={state}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded cursor-pointer text-sm",
                              selectedStates.includes(state)
                                ? "bg-amber-100 text-amber-800"
                                : "hover:bg-slate-100"
                            )}
                            onClick={() => handleStateToggle(state)}
                          >
                            <Checkbox checked={selectedStates.includes(state)} />
                            <span>{state}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700">Pricing Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minimumBudget">Minimum Budget (₹)</Label>
                        <Input
                          id="minimumBudget"
                          type="number"
                          {...form.register("minimumBudget", { valueAsNumber: true })}
                          placeholder="Minimum project value"
                          data-testid="input-minimum-budget"
                        />
                      </div>
                      <div>
                        <Label htmlFor="averageEventValue">Average Event Value (₹)</Label>
                        <Input
                          id="averageEventValue"
                          type="number"
                          {...form.register("averageEventValue", { valueAsNumber: true })}
                          placeholder="Average project value"
                          data-testid="input-average-event-value"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pricingTier">Pricing Tier</Label>
                        <Select onValueChange={(value) => form.setValue("pricingTier", value)}>
                          <SelectTrigger data-testid="select-pricing-tier">
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
                      <div>
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Select onValueChange={(value) => form.setValue("paymentTerms", value)}>
                          <SelectTrigger data-testid="select-payment-terms">
                            <SelectValue placeholder="Select terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="advance_full">100% Advance</SelectItem>
                            <SelectItem value="50_50">50% Advance, 50% Before Event</SelectItem>
                            <SelectItem value="30_40_30">30-40-30 Split</SelectItem>
                            <SelectItem value="on_completion">On Completion</SelectItem>
                            <SelectItem value="custom">Custom Terms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={form.watch("acceptsOnlinePayment")}
                        onCheckedChange={(checked) => form.setValue("acceptsOnlinePayment", checked as boolean)}
                      />
                      <span className="text-sm">Accepts Online Payments (UPI/NEFT/Cards)</span>
                    </div>

                    <h3 className="font-semibold text-slate-700 pt-4">Bank Details (for payments)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          {...form.register("bankName")}
                          placeholder="e.g., HDFC Bank"
                          data-testid="input-bank-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankBranch">Branch</Label>
                        <Input
                          id="bankBranch"
                          {...form.register("bankBranch")}
                          placeholder="Branch name"
                          data-testid="input-bank-branch"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          {...form.register("accountNumber")}
                          placeholder="Account number"
                          data-testid="input-account-number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          {...form.register("ifscCode")}
                          placeholder="e.g., HDFC0001234"
                          className="uppercase"
                          data-testid="input-ifsc-code"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                          id="accountHolderName"
                          {...form.register("accountHolderName")}
                          placeholder="As per bank records"
                          data-testid="input-account-holder-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          {...form.register("upiId")}
                          placeholder="yourname@upi"
                          data-testid="input-upi-id"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-4">Compliance & Certifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={form.watch("hasLiabilityInsurance")}
                            onCheckedChange={(checked) => form.setValue("hasLiabilityInsurance", checked as boolean)}
                          />
                          <div>
                            <span className="font-medium">Liability Insurance</span>
                            <p className="text-sm text-slate-500">Do you have professional liability insurance coverage?</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={form.watch("hasFireSafetyCertificate")}
                            onCheckedChange={(checked) => form.setValue("hasFireSafetyCertificate", checked as boolean)}
                          />
                          <div>
                            <span className="font-medium">Fire Safety Certificate</span>
                            <p className="text-sm text-slate-500">Valid fire safety compliance certificate</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={form.watch("hasPollutionCertificate")}
                            onCheckedChange={(checked) => form.setValue("hasPollutionCertificate", checked as boolean)}
                          />
                          <div>
                            <span className="font-medium">Pollution Control Certificate</span>
                            <p className="text-sm text-slate-500">If applicable to your business</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 mb-4">Declarations</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <Checkbox
                            checked={form.watch("hasNoPendingLitigation")}
                            onCheckedChange={(checked) => form.setValue("hasNoPendingLitigation", checked as boolean)}
                          />
                          <div>
                            <span className="font-medium">No Pending Litigation</span>
                            <p className="text-sm text-slate-500">I declare that there are no pending legal cases against the business</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50">
                          <Checkbox
                            checked={form.watch("hasNeverBlacklisted")}
                            onCheckedChange={(checked) => form.setValue("hasNeverBlacklisted", checked as boolean)}
                          />
                          <div>
                            <span className="font-medium">Never Blacklisted</span>
                            <p className="text-sm text-slate-500">I declare that the business has never been blacklisted by any organization</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 mb-4">Online Presence</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="websiteUrl">Website</Label>
                          <Input
                            id="websiteUrl"
                            {...form.register("websiteUrl")}
                            placeholder="https://yourwebsite.com"
                            data-testid="input-website-url"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instagramUrl">Instagram</Label>
                          <Input
                            id="instagramUrl"
                            {...form.register("instagramUrl")}
                            placeholder="https://instagram.com/yourbusiness"
                            data-testid="input-instagram-url"
                          />
                        </div>
                        <div>
                          <Label htmlFor="facebookUrl">Facebook</Label>
                          <Input
                            id="facebookUrl"
                            {...form.register("facebookUrl")}
                            placeholder="https://facebook.com/yourbusiness"
                            data-testid="input-facebook-url"
                          />
                        </div>
                        <div>
                          <Label htmlFor="youtubeUrl">YouTube</Label>
                          <Input
                            id="youtubeUrl"
                            {...form.register("youtubeUrl")}
                            placeholder="https://youtube.com/@yourbusiness"
                            data-testid="input-youtube-url"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 mb-4">Experience</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="yearsInBusiness">Years in Business</Label>
                          <Input
                            id="yearsInBusiness"
                            type="number"
                            {...form.register("yearsInBusiness", { valueAsNumber: true })}
                            placeholder="e.g., 10"
                            data-testid="input-years-in-business"
                          />
                        </div>
                        <div>
                          <Label htmlFor="eventsCompleted">Total Events Completed</Label>
                          <Input
                            id="eventsCompleted"
                            type="number"
                            {...form.register("eventsCompleted", { valueAsNumber: true })}
                            placeholder="e.g., 500"
                            data-testid="input-events-completed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h3 className="font-semibold text-amber-800 mb-2">Review Your Information</h3>
                      <p className="text-sm text-amber-700">
                        Please review all information before submitting. You can go back to any step to make changes.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Business Details</h4>
                        <dl className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Business Name:</dt>
                            <dd className="font-medium">{form.watch("businessName") || "-"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Entity Type:</dt>
                            <dd className="font-medium">{formatCategoryLabel(form.watch("entityType") || "")}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">PAN:</dt>
                            <dd className="font-medium">{form.watch("panNumber") || "-"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">GST:</dt>
                            <dd className="font-medium">{form.watch("gstNumber") || "-"}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Contact Details</h4>
                        <dl className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Contact Person:</dt>
                            <dd className="font-medium">{form.watch("contactPersonName") || "-"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Email:</dt>
                            <dd className="font-medium">{form.watch("contactEmail") || "-"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Phone:</dt>
                            <dd className="font-medium">{form.watch("contactPhone") || "-"}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCategories.map(cat => (
                            <span key={cat} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              {formatCategoryLabel(cat)}
                            </span>
                          ))}
                          {selectedCategories.length === 0 && <span className="text-sm text-slate-500">None selected</span>}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Service Areas</h4>
                        <p className="text-sm">
                          {form.watch("panIndiaService") ? "Pan-India" : selectedStates.join(", ") || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={form.watch("agreesToTerms")}
                          onCheckedChange={(checked) => form.setValue("agreesToTerms", checked as boolean)}
                          data-testid="checkbox-agree-terms"
                        />
                        <div>
                          <span className="font-medium text-sm">I agree to the Terms and Conditions *</span>
                          <p className="text-xs text-slate-500">
                            By checking this box, I confirm that all information provided is accurate and I agree to the vendor partnership terms.
                          </p>
                        </div>
                      </div>
                      {form.formState.errors.agreesToTerms && (
                        <p className="text-sm text-red-500">{form.formState.errors.agreesToTerms.message}</p>
                      )}

                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={form.watch("agreesToNda")}
                          onCheckedChange={(checked) => form.setValue("agreesToNda", checked as boolean)}
                          data-testid="checkbox-agree-nda"
                        />
                        <div>
                          <span className="font-medium text-sm">I agree to the Non-Disclosure Agreement</span>
                          <p className="text-xs text-slate-500">
                            I agree to keep client information confidential.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    data-testid="button-prev-step"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  {currentStep < steps.length ? (
                    <Button type="button" onClick={nextStep} data-testid="button-next-step">
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createRegistration.isPending}
                      className="bg-amber-500 hover:bg-amber-600"
                      data-testid="button-submit-registration"
                    >
                      {createRegistration.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit Registration
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
