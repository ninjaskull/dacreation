import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/luxury_indian_wedding_reception_venue.png";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Luxury Wedding" 
          className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out transform scale-100 hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] mb-6 text-secondary font-medium">
            Curating Memories
          </h2>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight mb-8 drop-shadow-lg">
            Timeless Elegance, <br />
            <span className="italic text-white/90">Culturally Inspired</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-white/90 font-light mb-10 leading-relaxed">
            We design bespoke Indian weddings that blend modern luxury with rich tradition, creating unforgettable experiences for you and your guests.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-none bg-secondary hover:bg-secondary/90 text-primary-foreground px-8 py-6 text-lg min-w-[200px]"
            >
              Plan Your Wedding
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-none border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg min-w-[200px] backdrop-blur-sm bg-white/5"
            >
              View Portfolio
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
