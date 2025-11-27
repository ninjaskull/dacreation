import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronRight, ChevronLeft, Phone, Mail, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Validation Schemas for each step
const step1Schema = z.object({
  eventType: z.enum(["wedding", "corporate", "social", "destination"], {
    required_error: "Please select an event type.",
  }),
});

const step2Schema = z.object({
  date: z.date({ required_error: "Please select a tentative date." }),
  guestCount: z.number().min(1, "Guest count is required"),
  location: z.string().min(2, "Location/City is required"),
});

const step3Schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  contactMethod: z.enum(["whatsapp", "call", "email"]).default("whatsapp"),
});

// Combined schema for final submission
const formSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type FormData = z.infer<typeof formSchema>;

const eventTypes = [
  { id: "wedding", title: "Wedding", icon: "💍", desc: "Full planning, decor, & rituals" },
  { id: "corporate", title: "Corporate", icon: "🏢", desc: "Conferences, galas, & launches" },
  { id: "social", title: "Social Party", icon: "🎉", desc: "Birthdays, anniversaries, & more" },
  { id: "destination", title: "Destination", icon: "✈️", desc: "Travel, logistics, & hospitality" },
];

export function LeadCaptureWizard() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema),
    mode: "onChange",
    defaultValues: {
      guestCount: 100,
      contactMethod: "whatsapp",
    }
  });

  const { trigger, getValues, setValue, watch } = form;
  const currentEventType = watch("eventType");

  const nextStep = async () => {
    const isValid = await trigger(step === 1 ? ["eventType"] : step === 2 ? ["date", "guestCount", "location"] : undefined);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: FormData) => {
    const isValid = await trigger();
    if (!isValid) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setStep(4);
      toast({
        title: "Success",
        description: "Your inquiry has been submitted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-border/40 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-muted w-full">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-6 md:p-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Event Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <span className="text-secondary uppercase tracking-widest text-xs font-bold">Step 1 of 3</span>
                <h2 className="font-serif text-3xl text-primary mt-2">What are you celebrating?</h2>
                <p className="text-muted-foreground">Select the type of event you are planning.</p>
              </div>

              <Form {...form}>
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventTypes.map((type) => (
                        <div 
                          key={type.id}
                          onClick={() => {
                            field.onChange(type.id);
                            // Optional: Auto advance on selection for smoother flow
                            // setTimeout(() => nextStep(), 300); 
                          }}
                          className={cn(
                            "cursor-pointer border rounded-lg p-6 transition-all hover:border-primary hover:bg-primary/5 flex items-start space-x-4",
                            field.value === type.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                          )}
                        >
                          <span className="text-3xl">{type.icon}</span>
                          <div>
                            <h3 className="font-medium text-foreground">{type.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                          </div>
                          {field.value === type.id && <Check className="w-5 h-5 text-primary ml-auto" />}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </Form>

              <Button onClick={nextStep} className="w-full mt-6" size="lg" disabled={!currentEventType}>
                Continue <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="text-center mb-8">
                <span className="text-secondary uppercase tracking-widest text-xs font-bold">Step 2 of 3</span>
                <h2 className="font-serif text-3xl text-primary mt-2">Tell us the details</h2>
                <p className="text-muted-foreground">Help us understand the scale of your event.</p>
              </div>

              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tentative Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal h-12",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City / Venue Preference</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g. Udaipur, Mumbai, Beach Resort..." {...field} className="pl-10 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          <span>Estimated Guest Count</span>
                          <span className="text-primary font-bold">{field.value} Guests</span>
                        </FormLabel>
                        <FormControl>
                          <div className="pt-4 pb-2">
                            <Slider
                              min={50}
                              max={1000}
                              step={10}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="py-4"
                            />
                          </div>
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>50</span>
                          <span>500</span>
                          <span>1000+</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                <Button onClick={nextStep} className="flex-1">Continue <ChevronRight className="ml-2 w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Contact Info (The Sales Focus) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <span className="text-secondary uppercase tracking-widest text-xs font-bold">Final Step</span>
                <h2 className="font-serif text-3xl text-primary mt-2">Where should we send your quote?</h2>
                <p className="text-muted-foreground">We'll prepare a custom proposal for you.</p>
              </div>

              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Your Name" {...field} className="pl-10 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-medium">Phone Number (WhatsApp Preferred)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-primary" />
                            <Input placeholder="+91 98765 43210" {...field} className="pl-10 h-12 border-primary/30 focus:border-primary bg-primary/5" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="name@example.com" {...field} className="pl-10 h-12" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Preferred Contact Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="whatsapp" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Send Quote via WhatsApp (Fastest)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="call" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Call me directly
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="email" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Email only
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={prevStep} className="flex-1">Back</Button>
                <Button onClick={form.handleSubmit(onSubmit)} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Get My Free Quote"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-serif text-3xl text-primary mb-4">Inquiry Received!</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Thank you, {getValues("name")}. We have received your details. One of our senior planners will reach out to you shortly on <strong>{getValues("phone")}</strong> to discuss your {getValues("eventType")}.
              </p>
              <Button onClick={() => window.location.href = "/"} variant="outline">
                Return Home
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
