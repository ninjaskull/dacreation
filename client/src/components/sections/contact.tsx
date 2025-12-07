import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Phone, Calendar, Check } from "lucide-react";
import { budgetRanges } from "@shared/schema";
import { useBranding } from "@/contexts/BrandingContext";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  eventType: z.string().min(1, { message: "Please select event type." }),
  budgetRange: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export function Contact() {
  const { toast } = useToast();
  const { branding } = useBranding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      eventType: "",
      budgetRange: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          leadSource: "contact_form",
          contactMethod: "email",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSuccess(true);
      toast({
        title: "Inquiry Sent!",
        description: "Thank you! We'll contact you within 24 hours.",
      });
      form.reset();
      
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const eventTypes = [
    { value: "wedding", label: "Wedding" },
    { value: "corporate", label: "Corporate Event" },
    { value: "social", label: "Social Party" },
    { value: "destination", label: "Destination Event" },
  ];

  return (
    <section id="contact" className="py-20 md:py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          
          <div className="order-2 md:order-1">
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Contact Us</span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary mb-6">Let’s Create Something Unforgettable</h2>
            <p className="text-muted-foreground text-lg font-light mb-8">
              Whether it's a grand wedding, a corporate gathering, or a private celebration, we’re here to make it extraordinary.
            </p>
            
            <div className="space-y-8 font-light text-foreground/80">
              <div className="flex items-start space-x-4">
                <div className="mt-1 text-primary text-xl">✉️</div>
                <div>
                  <h4 className="font-medium text-foreground">Email</h4>
                  <span>{branding.contact.email}</span>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 text-primary text-xl">📞</div>
                <div>
                  <h4 className="font-medium text-foreground">Phone / WhatsApp</h4>
                  <span>{branding.contact.phones[0]}</span>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 text-primary text-xl">📍</div>
                <div>
                  <h4 className="font-medium text-foreground">Office</h4>
                  <span>{branding.addresses.primary.full}<br/><span className="text-sm text-muted-foreground">Available globally for destination events.</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/20 p-6 md:p-10 shadow-sm border border-border/50 relative order-1 md:order-2">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-serif text-2xl text-primary mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-4">
                  We've received your inquiry and will contact you within 24 hours.
                </p>
                <div className="flex flex-col gap-2">
                  <a 
                    href={`https://wa.me/${branding.contact.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    Or chat with us on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} className="bg-white" data-testid="contact-input-name" />
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
                        <FormLabel className="uppercase text-xs tracking-widest text-primary font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} className="bg-white border-primary/30" data-testid="contact-input-phone" />
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
                        <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} className="bg-white" data-testid="contact-input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white" data-testid="contact-select-event">
                                <SelectValue placeholder="Select" />
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
                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Budget</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white" data-testid="contact-select-budget">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {budgetRanges.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your event..." 
                            className="resize-none bg-white min-h-[80px]" 
                            {...field} 
                            data-testid="contact-textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full rounded-none bg-primary hover:bg-primary/90 text-white h-12 text-sm tracking-widest uppercase"
                    disabled={isSubmitting}
                    data-testid="contact-button-submit"
                  >
                    {isSubmitting ? "Sending..." : "Get Your Free Consultation →"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll call you within 24 hours to discuss your event.
                  </p>
                </form>
              </Form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
