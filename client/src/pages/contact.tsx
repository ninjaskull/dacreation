import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Calendar,
  Check,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ArrowRight,
  Globe,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { budgetRanges } from "@shared/schema";
import { SEOHead, SEO_DATA, getLocalBusinessSchema, getBreadcrumbSchema } from "@/components/seo/SEOHead";

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface WebsiteSettings {
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsappNumber: string | null;
  mapEmbedCode: string | null;
  topBarAddress: string | null;
  secondaryAddress: string | null;
  socialMedia: SocialLink[];
  numberOfEventsHeld: number;
  ratings: number;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  eventType: z.string().min(1, { message: "Please select event type." }),
  budgetRange: z.string().optional(),
  eventDate: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Party" },
  { value: "destination", label: "Destination Event" },
];

const officeDetails = {
  workingHours: [
    { day: "Monday - Friday", time: "10:00 AM - 7:00 PM" },
    { day: "Saturday", time: "10:00 AM - 5:00 PM" },
    { day: "Sunday", time: "By Appointment Only" },
  ],
  additionalLocations: [
    { city: "Delhi NCR", available: true },
    { city: "Bangalore", available: true },
    { city: "Goa", available: true },
    { city: "Jaipur", available: true },
    { city: "International", available: true },
  ],
};

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

const DEFAULT_SETTINGS: WebsiteSettings = {
  address: "123 Event Avenue, Bandra West, Mumbai, Maharashtra 400050, India",
  phone: "+91 98765 43210",
  email: "hello@dacreation.com",
  whatsappNumber: "+91 98765 43210",
  mapEmbedCode: null,
  topBarAddress: "Mumbai, India",
  secondaryAddress: null,
  socialMedia: [],
  numberOfEventsHeld: 500,
  ratings: 5,
};

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: settings } = useQuery<WebsiteSettings>({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const response = await fetch("/api/settings/website");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  const currentSettings = settings || DEFAULT_SETTINGS;

  const contactMethods = useMemo(() => {
    const methods = [];
    
    if (currentSettings.phone) {
      const phoneClean = currentSettings.phone.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      methods.push({
        icon: Phone,
        title: "Phone",
        description: "Call us directly for immediate assistance",
        value: currentSettings.phone,
        href: `tel:${phoneClean}`,
        color: "bg-blue-50 text-blue-600",
      });
    }
    
    if (currentSettings.whatsappNumber) {
      const waClean = currentSettings.whatsappNumber.replace(/\s+/g, '').replace(/[^+\d]/g, '').replace('+', '');
      methods.push({
        icon: MessageCircle,
        title: "WhatsApp",
        description: "Chat with us on WhatsApp for quick responses",
        value: currentSettings.whatsappNumber,
        href: `https://wa.me/${waClean}`,
        color: "bg-green-50 text-green-600",
      });
    }
    
    if (currentSettings.email) {
      methods.push({
        icon: Mail,
        title: "Email",
        description: "Send us an email for detailed inquiries",
        value: currentSettings.email,
        href: `mailto:${currentSettings.email}`,
        color: "bg-purple-50 text-purple-600",
      });
    }

    methods.push({
      icon: Calendar,
      title: "Book Consultation",
      description: "Schedule a free consultation with our team",
      value: "Get Free Quote",
      href: "/inquire",
      color: "bg-amber-50 text-amber-600",
    });

    return methods;
  }, [currentSettings]);

  const socialLinks = useMemo(() => {
    if (!currentSettings.socialMedia || currentSettings.socialMedia.length === 0) {
      return [];
    }
    return currentSettings.socialMedia.filter(link => link.url).map(link => ({
      icon: SOCIAL_ICON_MAP[link.platform.toLowerCase()] || Globe,
      href: link.url,
      label: link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
    }));
  }, [currentSettings.socialMedia]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      eventType: "",
      budgetRange: "",
      eventDate: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { eventDate, ...rest } = values;
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rest,
          date: eventDate || undefined,
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

  const whatsappLink = useMemo(() => {
    if (currentSettings.whatsappNumber) {
      const waClean = currentSettings.whatsappNumber.replace(/\s+/g, '').replace(/[^+\d]/g, '').replace('+', '');
      return `https://wa.me/${waClean}`;
    }
    return "https://wa.me/919876543210";
  }, [currentSettings.whatsappNumber]);

  const phoneLink = useMemo(() => {
    if (currentSettings.phone) {
      const phoneClean = currentSettings.phone.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      return `tel:${phoneClean}`;
    }
    return "tel:+919876543210";
  }, [currentSettings.phone]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <SEOHead
        title={SEO_DATA.contact.title}
        description={SEO_DATA.contact.description}
        keywords={SEO_DATA.contact.keywords}
        canonicalUrl="https://dacreation.com/contact"
        structuredData={{
          ...getLocalBusinessSchema(),
          ...getBreadcrumbSchema([
            { name: "Home", url: "https://dacreation.com" },
            { name: "Contact", url: "https://dacreation.com/contact" }
          ])
        }}
      />
      <Navbar />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary via-primary to-primary/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">
                Get In Touch
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
                Let's Create Something <span className="italic">Extraordinary</span>
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                Whether you're planning a lavish wedding, a corporate event, or an intimate celebration, 
                we're here to turn your vision into reality. Reach out to us today.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Contact Methods */}
        <section className="py-12 -mt-8 relative z-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.title}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all group"
                  data-testid={`contact-method-${method.title.toLowerCase()}`}
                >
                  <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                  <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    {method.value}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
              
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">
                  Contact Information
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6">
                  Visit Our Office
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Drop by our office for a face-to-face consultation, or connect with us through 
                  any of the channels below. We're always happy to hear from you.
                </p>

                {/* Office Address */}
                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Head Office</h4>
                      <p className="text-muted-foreground">{currentSettings.address || DEFAULT_SETTINGS.address}</p>
                      <a 
                        href="https://maps.google.com/?q=Bandra+West+Mumbai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm font-medium mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all"
                        data-testid="link-google-maps"
                      >
                        Get Directions <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Working Hours</h4>
                      <div className="space-y-1">
                        {officeDetails.workingHours.map((schedule) => (
                          <div key={schedule.day} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{schedule.day}</span>
                            <span className="text-foreground font-medium">{schedule.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">We Serve Across India & Internationally</h4>
                      <div className="flex flex-wrap gap-2">
                        {officeDetails.additionalLocations.map((location) => (
                          <span 
                            key={location.city}
                            className="px-3 py-1 bg-secondary/50 text-sm rounded-full text-muted-foreground"
                          >
                            {location.city}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                {socialLinks.length > 0 && (
                  <div className="border-t border-border pt-8">
                    <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
                    <div className="flex flex-wrap gap-3">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg hover:bg-primary hover:text-white transition-colors group"
                          data-testid={`contact-social-${social.label.toLowerCase()}`}
                        >
                          <social.icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{social.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map Embed */}
                <div className="mt-10 rounded-xl overflow-hidden border border-border shadow-sm">
                  {currentSettings.mapEmbedCode ? (
                    <div dangerouslySetInnerHTML={{ __html: currentSettings.mapEmbedCode }} />
                  ) : (
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0!2d72.8347!3d19.0596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzM0LjYiTiA3MsKwNTAnMDQuOSJF!5e0!3m2!1sen!2sin!4v1699000000000!5m2!1sen!2sin"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="DA Creation Office Location"
                      data-testid="contact-map"
                    />
                  )}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-primary">Send Us a Message</h3>
                      <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  {isSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="font-serif text-2xl text-primary mb-3">Thank You!</h3>
                      <p className="text-muted-foreground mb-6">
                        We've received your inquiry and will contact you within 24 hours.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Chat on WhatsApp
                          </Button>
                        </a>
                        <a href={phoneLink}>
                          <Button variant="outline" className="gap-2">
                            <Phone className="w-4 h-4" />
                            Call Us Now
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your Name" {...field} data-testid="contact-form-name" />
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
                                <FormLabel className="text-primary font-medium flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> Phone Number *
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="+91 98765 43210" {...field} className="border-primary/30" data-testid="contact-form-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Email Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} data-testid="contact-form-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="eventType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-foreground">Event Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="contact-form-event">
                                      <SelectValue placeholder="Select event type" />
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
                                <FormLabel className="text-foreground">Budget Range</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="contact-form-budget">
                                      <SelectValue placeholder="Select budget" />
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
                          name="eventDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Tentative Event Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="contact-form-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Your Message *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your event vision, special requirements, or any questions you have..." 
                                  className="resize-none min-h-[120px]" 
                                  {...field} 
                                  data-testid="contact-form-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base"
                          disabled={isSubmitting}
                          data-testid="contact-form-submit"
                        >
                          {isSubmitting ? "Sending..." : (
                            <>
                              Send Inquiry
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          By submitting this form, you agree to our privacy policy. 
                          We'll contact you within 24 hours.
                        </p>
                      </form>
                    </Form>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="stat-events">
                      {currentSettings.numberOfEventsHeld || 500}+
                    </div>
                    <div className="text-xs text-muted-foreground">Events Delivered</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="stat-rating">
                      {currentSettings.ratings || 4.9}
                    </div>
                    <div className="text-xs text-muted-foreground">Client Rating</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary">2hrs</div>
                    <div className="text-xs text-muted-foreground">Avg. Response</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-serif text-2xl md:text-3xl text-primary mb-4">Have Questions?</h2>
            <p className="text-muted-foreground mb-6">Check out our frequently asked questions or reach out directly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#faq">
                <Button variant="outline" className="gap-2" data-testid="link-faq">
                  View FAQs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/inquire">
                <Button className="gap-2" data-testid="link-inquire">
                  <Calendar className="w-4 h-4" />
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
