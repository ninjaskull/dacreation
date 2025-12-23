import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, X, Phone, User, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFloatingWidget } from "@/contexts/FloatingWidgetContext";
import { useIsMobile } from "@/hooks/use-mobile";

const quickFormSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  eventType: z.string().min(1, "Select event type"),
});

type QuickFormData = z.infer<typeof quickFormSchema>;

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate" },
  { value: "social", label: "Social Party" },
  { value: "destination", label: "Destination" },
];

export function FloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { openWidget, setOpenWidget } = useFloatingWidget();
  const isMobile = useIsMobile();

  const form = useForm<QuickFormData>({
    resolver: zodResolver(quickFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      eventType: "",
    },
  });

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    setOpenWidget(open ? "callback" : "none");
  };

  // Close form on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      handleToggle(false);
    }
  };

  const onSubmit = async (data: QuickFormData) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          eventType: data.eventType,
          source: "floating_cta",
          priority: "normal",
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setIsSuccess(true);
      toast({
        title: "Request Received!",
        description: "We'll call you back within 30 minutes during business hours.",
      });

      setTimeout(() => {
        handleToggle(false);
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

  const shouldHideButton = isMobile && openWidget === "chat";

  const handleCloseForm = () => {
    handleToggle(false);
  };

  return (
    <div className="floating-widget" onKeyDown={handleKeyDown}>
      <AnimatePresence>
        {!shouldHideButton && (
          <motion.button
            onClick={() => handleToggle(!isOpen)}
            className="fixed bottom-6 right-4 md:right-6 md:bottom-16 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid="floating-cta-button"
          >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Phone className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && !shouldHideButton && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-16 right-24 z-50 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-primary hidden md:block"
          >
            Talk to an Event Planner
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !shouldHideButton && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 md:right-6 md:bottom-32 z-50 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-xl shadow-2xl border overflow-hidden"
            data-testid="floating-cta-form"
          >
            {!isSuccess ? (
              <>
                <div className="bg-primary p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Request a Call Back</h3>
                      <p className="text-xs text-white/80">We'll call you within 30 mins</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="text-white hover:bg-white/20 p-1 rounded transition-colors"
                    data-testid="floating-cta-close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Your Name" {...field} className="pl-10 h-10" data-testid="floating-input-name" />
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
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                                <Input placeholder="+91 98765 43210" {...field} className="pl-10 h-10 border-primary/30" data-testid="floating-input-phone" />
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
                                <SelectTrigger className="h-10" data-testid="floating-select-event">
                                  <SelectValue placeholder="Event Type" />
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
                        disabled={isSubmitting}
                        data-testid="floating-button-submit"
                      >
                        {isSubmitting ? "Sending..." : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Request Call Back
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-lg mb-1">We'll Call You!</h3>
                <p className="text-sm text-muted-foreground">
                  Expect a call within 30 minutes during business hours.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
