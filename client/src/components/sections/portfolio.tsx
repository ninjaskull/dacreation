import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import wedding1 from "@assets/generated_images/indian_bride_and_groom_minimalist.png";
import wedding2 from "@assets/generated_images/luxury_indian_wedding_reception_venue.png"; // Reusing for variety
import wedding3 from "@assets/generated_images/indian_wedding_decor_detail.png";

const weddings = [
  {
    couple: "Riya & Arjun",
    location: "Udaipur, Rajasthan",
    image: wedding1,
    category: "Destination Wedding"
  },
  {
    couple: "Priya & Sameer",
    location: "The Oberoi, Mumbai",
    image: wedding2,
    category: "Luxury Reception"
  },
  {
    couple: "Ananya & Kabir",
    location: "Goa Beach Resort",
    image: wedding3,
    category: "Intimate Ceremony"
  }
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Our Portfolio</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary">Featured Celebrations</h2>
          </div>
          <Button variant="link" className="hidden md:inline-flex text-primary hover:text-secondary text-lg group">
            View All Weddings <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {weddings.map((wedding, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-4">
                <div className="absolute inset-0 border-[12px] border-white/80 z-10 transition-all duration-500 group-hover:border-white/0"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-20"></div>
                <img 
                  src={wedding.image} 
                  alt={wedding.couple} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-8 left-8 z-30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <p className="text-sm uppercase tracking-widest mb-2">{wedding.category}</p>
                  <h3 className="font-serif text-3xl">{wedding.couple}</h3>
                  <p className="font-light italic mt-1">{wedding.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" className="w-full border-primary text-primary">View All Weddings</Button>
        </div>
      </div>
    </section>
  );
}
