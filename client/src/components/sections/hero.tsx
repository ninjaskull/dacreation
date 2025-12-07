import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/luxury_indian_wedding_reception_venue.webp";

import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#1a1a1a]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Luxury Indian Wedding Venue - DA Creation Event Management" 
          className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out transform scale-100 hover:scale-105"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] mb-6 text-secondary font-medium">
            Seamless. Creative. Unforgettable.
          </h2>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-medium leading-tight mb-8 drop-shadow-lg">
            Crafting Exceptional Events With <br />
            <span className="italic text-white/90">Modern Elegance & Cultural Soul</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 font-light mb-10 leading-relaxed">
            From lavish Indian weddings to high-impact corporate events and intimate private celebrations, we design experiences that are seamless, creative, and unforgettable.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/inquire">
              <Button 
                size="lg" 
                className="rounded-none bg-secondary hover:bg-secondary/90 text-primary-foreground px-8 py-6 text-lg min-w-[200px]"
              >
                Let’s Plan Your Event →
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-none border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg min-w-[200px] backdrop-blur-sm bg-white/5"
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Our Portfolio
            </Button>
          </div>
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
