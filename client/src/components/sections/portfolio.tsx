import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import wedding1 from "@assets/generated_images/indian_bride_and_groom_minimalist.png";
import corporate1 from "@assets/generated_images/corporate_event_gala.png";
import social1 from "@assets/generated_images/luxury_private_dinner.png";

// We will need to update these images with the newly generated ones for corporate/social
const portfolioItems = [
  {
    title: "Riya & Arjun",
    category: "Destination Wedding",
    location: "Udaipur, Rajasthan",
    image: wedding1
  },
  {
    title: "TechSummit 2024",
    category: "Corporate Event",
    location: "Grand Hyatt, Mumbai",
    image: corporate1
  },
  {
    title: "Radhika's 50th",
    category: "Social Celebration",
    location: "Private Estate, Delhi",
    image: social1
  }
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Our Portfolio</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6">Featured Moments</h2>
            <p className="text-muted-foreground text-lg font-light">
              Every event tells a story. Browse through our curated collection of events crafted with intention, precision, and emotion.
            </p>
          </div>
          <Button variant="link" className="hidden md:inline-flex text-primary hover:text-secondary text-lg group mt-6 md:mt-0">
            View Full Portfolio <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-4">
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-20 duration-500"></div>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 w-full p-8 z-30 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-xs uppercase tracking-widest mb-2 text-secondary">{item.category}</p>
                  <h3 className="font-serif text-2xl mb-1">{item.title}</h3>
                  <p className="font-light text-sm opacity-80">{item.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" className="w-full border-primary text-primary">View Full Portfolio</Button>
        </div>
      </div>
    </section>
  );
}
