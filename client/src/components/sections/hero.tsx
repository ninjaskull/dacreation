import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/luxury_indian_wedding_reception_venue.webp";
import { useBranding } from "@/contexts/BrandingContext";
import { Link } from "wouter";
import { Building2, Heart, Users, Award } from "lucide-react";

export function Hero() {
  const { branding } = useBranding();
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-[#1a1a1a]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt={`Premium Event Management - ${branding.company.name} Weddings & Corporate Events`} 
          className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out transform scale-100 hover:scale-105"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white pt-24 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] mb-6 text-secondary font-medium">
            Weddings • Corporate Events • Celebrations
          </h2>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium leading-tight mb-8 drop-shadow-lg">
            Crafting Exceptional Events With <br />
            <span className="italic text-white/90">Precision, Creativity & Impact</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 font-light mb-10 leading-relaxed">
            From grand Indian weddings to high-impact corporate conferences, product launches, and milestone celebrations—we deliver experiences that leave lasting impressions on every guest.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/inquire">
              <Button 
                size="lg" 
                className="rounded-none bg-secondary hover:bg-secondary/90 text-primary-foreground px-8 py-6 text-lg min-w-[200px]"
              >
                Plan Your Event →
              </Button>
            </Link>
            <Link href="/services/corporate">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-none border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg min-w-[200px] backdrop-blur-sm bg-white/5"
              >
                Corporate Solutions
              </Button>
            </Link>
          </div>

          {/* Stats Bar - Showing Both Wedding & Corporate Excellence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg">
              <Heart className="w-6 h-6 text-secondary mb-2" />
              <span className="text-2xl md:text-3xl font-bold text-white">{branding.stats.weddingsCount}+</span>
              <span className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Weddings</span>
            </div>
            <div className="flex flex-col items-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg">
              <Building2 className="w-6 h-6 text-secondary mb-2" />
              <span className="text-2xl md:text-3xl font-bold text-white">{branding.stats.corporateCount}+</span>
              <span className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Corporate Events</span>
            </div>
            <div className="flex flex-col items-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg">
              <Users className="w-6 h-6 text-secondary mb-2" />
              <span className="text-2xl md:text-3xl font-bold text-white">{branding.stats.happyClients}+</span>
              <span className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Happy Clients</span>
            </div>
            <div className="flex flex-col items-center p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg">
              <Award className="w-6 h-6 text-secondary mb-2" />
              <span className="text-2xl md:text-3xl font-bold text-white">{branding.stats.yearsExperience}+</span>
              <span className="text-xs md:text-sm text-white/70 uppercase tracking-wide">Years Experience</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-white/70"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent mx-auto"></div>
        <span className="text-[10px] uppercase tracking-widest mt-2 block">Scroll</span>
      </motion.div>
    </section>
  );
}
