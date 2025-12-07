import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useBranding } from "@/contexts/BrandingContext";

export function ConsultationCTA() {
  const { branding } = useBranding();
  
  const whatsappNumber = branding.contact.whatsapp.replace(/[^0-9]/g, '');
  const phoneNumber = branding.contact.phones[0]?.replace(/\s+/g, '') || '';

  return (
    <section className="py-16 bg-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">
              Ready to Get Started?
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4">
              Book Your Free Consultation
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg">
              Speak with our expert event planners and get a personalized quote for your celebration. No obligation, just expert guidance.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6"
        >
          <Link href="/inquire">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 min-w-[240px] h-14 text-base"
              data-testid="cta-book-consultation"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Free Consultation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 min-w-[240px] h-14 text-base"
              data-testid="cta-whatsapp"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat on WhatsApp
            </Button>
          </a>

          <a href={`tel:${phoneNumber}`}>
            <Button 
              size="lg" 
              variant="ghost" 
              className="text-white hover:bg-white/10 min-w-[180px] h-14 text-base"
              data-testid="cta-call"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Response within 2 hours
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            No commitment required
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Expert planners available
          </div>
        </motion.div>
      </div>
    </section>
  );
}
