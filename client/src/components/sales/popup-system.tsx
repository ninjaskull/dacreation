import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Gift, Phone, Mail, User, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { budgetRanges } from "@shared/schema";

const popupFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  eventType: z.string().min(1, "Please select event type"),
});

type PopupFormData = z.infer<typeof popupFormSchema>;

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Party" },
  { value: "destination", label: "Destination Event" },
];

interface PopupProps {
  type: "exit-intent" | "timed";
  isOpen: boolean;
  onClose: () => void;
}

function LeadCapturePopup({ type, isOpen, onClose }: PopupProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PopupFormData>({
    resolver: zodResolver(popupFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      eventType: "",
    },
  });

  const onSubmit = async (data: PopupFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          leadSource: type === "exit-intent" ? "popup" : "popup",
          contactMethod: "whatsapp",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSuccess(true);
      toast({
        title: "Thank you!",
        description: "We'll contact you within 24 hours with your free quote.",
      });
      
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        form.reset();
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = type === "exit-intent" ? {
    icon: <Gift className="w-8 h-8 text-secondary" />,
    title: "Wait! Get Your Free Event Quote",
    subtitle: "Don't leave without your personalized event planning estimate",
    cta: "Get My Free Quote",
  } : {
    icon: <Sparkles className="w-8 h-8 text-secondary" />,
    title: "Planning an Event?",
    subtitle: "Get a free consultation with our expert planners",
    cta: "Request Free Consultation",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" data-testid="lead-popup-dialog">
        <DialogTitle className="sr-only">{content.title}</DialogTitle>
        <DialogDescription className="sr-only">{content.subtitle}</DialogDescription>
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-primary p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {content.icon}
                </div>
                <h2 className="font-serif text-2xl mb-2">{content.title}</h2>
                <p className="text-white/80 text-sm">{content.subtitle}</p>
              </div>

              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Your Name" {...field} className="pl-10" data-testid="popup-input-name" />
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
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-primary" />
                              <Input placeholder="+91 98765 43210" {...field} className="pl-10 border-primary/30" data-testid="popup-input-phone" />
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
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="your@email.com" {...field} className="pl-10" data-testid="popup-input-email" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="popup-select-event-type">
                                <SelectValue placeholder="Select Event Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eventTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg" 
                      disabled={isSubmitting}
                      data-testid="popup-button-submit"
                    >
                      {isSubmitting ? "Submitting..." : content.cta}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree to receive communications about your event.
                    </p>
                  </form>
                </Form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-serif text-2xl text-primary mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Our team will contact you within 24 hours with your personalized quote.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export function PopupSystem() {
  const [exitIntentOpen, setExitIntentOpen] = useState(false);
  const [timedPopupOpen, setTimedPopupOpen] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);
  const [hasShownTimedPopup, setHasShownTimedPopup] = useState(false);

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("popup_shown");
    if (hasSeenPopup) {
      setHasShownExitIntent(true);
      setHasShownTimedPopup(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!hasShownTimedPopup && !exitIntentOpen) {
        setTimedPopupOpen(true);
        setHasShownTimedPopup(true);
        sessionStorage.setItem("popup_shown", "true");
      }
    }, 35000);

    return () => clearTimeout(timer);
  }, [hasShownTimedPopup, exitIntentOpen]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (
        e.clientY <= 0 &&
        !hasShownExitIntent &&
        !timedPopupOpen &&
        !sessionStorage.getItem("popup_shown")
      ) {
        setExitIntentOpen(true);
        setHasShownExitIntent(true);
        sessionStorage.setItem("popup_shown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShownExitIntent, timedPopupOpen]);

  return (
    <>
      <LeadCapturePopup
        type="exit-intent"
        isOpen={exitIntentOpen}
        onClose={() => setExitIntentOpen(false)}
      />
      <LeadCapturePopup
        type="timed"
        isOpen={timedPopupOpen}
        onClose={() => setTimedPopupOpen(false)}
      />
    </>
  );
}
