import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, FileText, Calculator, Users, X, Phone, Mail, User, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const downloadFormSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
});

type DownloadFormData = z.infer<typeof downloadFormSchema>;

interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  downloadUrl: string;
}

const leadMagnets: LeadMagnet[] = [
  {
    id: "event-checklist",
    title: "Ultimate Event Planning Checklist",
    description: "A comprehensive 50-point checklist covering everything from venue selection to post-event follow-up.",
    icon: <FileText className="w-8 h-8" />,
    downloadUrl: "#",
  },
  {
    id: "budget-calculator",
    title: "Event Budget Calculator",
    description: "Interactive spreadsheet to plan and track your event expenses like a professional.",
    icon: <Calculator className="w-8 h-8" />,
    downloadUrl: "#",
  },
  {
    id: "vendor-list",
    title: "Curated Vendor Directory",
    description: "Our handpicked list of top-rated vendors for catering, decor, photography, and more.",
    icon: <Users className="w-8 h-8" />,
    downloadUrl: "#",
  },
];

function LeadMagnetDownloadModal({
  magnet,
  isOpen,
  onClose,
}: {
  magnet: LeadMagnet | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<DownloadFormData>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: DownloadFormData) => {
    if (!magnet) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          eventType: "inquiry",
          leadSource: "lead_magnet",
          leadMagnet: magnet.id,
          contactMethod: "email",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSuccess(true);
      toast({
        title: "Download Ready!",
        description: "Check your email for the download link.",
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

  if (!magnet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="lead-magnet-modal">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  {magnet.icon}
                </div>
                <DialogTitle className="font-serif text-xl">{magnet.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">{magnet.description}</p>
              </DialogHeader>

              <div className="mt-6">
                <p className="text-sm text-center mb-4 font-medium">Enter your details to download:</p>
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
                              <Input placeholder="Your Name" {...field} className="pl-10" data-testid="magnet-input-name" />
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
                              <Input placeholder="your@email.com" {...field} className="pl-10" data-testid="magnet-input-email" />
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
                              <Input placeholder="+91 98765 43210" {...field} className="pl-10 border-primary/30" data-testid="magnet-input-phone" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      data-testid="magnet-button-download"
                    >
                      {isSubmitting ? "Processing..." : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Get Free Download
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By downloading, you agree to receive event planning tips and updates.
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
              className="py-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-serif text-xl text-primary mb-2">Download Ready!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                We've sent the {magnet.title} to your email.
              </p>
              <p className="text-xs text-muted-foreground">
                Don't see it? Check your spam folder.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export function LeadMagnetsSection() {
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMagnetClick = (magnet: LeadMagnet) => {
    setSelectedMagnet(magnet);
    setIsModalOpen(true);
  };

  return (
    <section className="py-16 bg-muted/30" id="resources">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">
            Free Resources
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-4">
            Download Our Event Planning Toolkit
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get professional event planning resources used by our expert team, absolutely free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadMagnets.map((magnet) => (
            <motion.div
              key={magnet.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/30" onClick={() => handleMagnetClick(magnet)} data-testid={`magnet-card-${magnet.id}`}>
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {magnet.icon}
                  </div>
                  <CardTitle className="font-serif text-lg">{magnet.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="mb-4">{magnet.description}</CardDescription>
                  <Button variant="outline" className="group">
                    Download Free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <LeadMagnetDownloadModal
        magnet={selectedMagnet}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
