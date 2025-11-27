import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import planningImg from "@assets/generated_images/wedding_planning_detail_shot.png";
import decorImg from "@assets/generated_images/indian_wedding_decor_detail.png";
import logisticsImg from "@assets/generated_images/luxury_indian_wedding_reception_venue.png"; // Reusing venue for logistics context

const services = [
  {
    title: "Full Wedding Planning",
    description: "From venue selection to the final vidaai, we manage every detail so you can cherish every moment.",
    image: planningImg,
    icon: "📋"
  },
  {
    title: "Decor & Design",
    description: "Transforming spaces with bespoke floral arrangements, lighting, and thematic decor that reflects your style.",
    image: decorImg,
    icon: "✨"
  },
  {
    title: "Logistics & Coordination",
    description: "Seamless vendor management, guest hospitality, and timeline execution for a flawless celebration.",
    image: logisticsImg,
    icon: "clock"
  }
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle Background Texture */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Our Expertise</span>
          <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6">Curated Services</h2>
          <p className="text-muted-foreground text-lg font-light">
            We specialize in bringing modern luxury to traditional celebrations, ensuring every event is a masterpiece of design and execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group"
            >
              <div className="relative h-[400px] overflow-hidden mb-6 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="w-12 h-1 bg-secondary mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="font-serif text-2xl mb-2">{service.title}</h3>
                  <p className="text-white/80 font-light text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {service.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
