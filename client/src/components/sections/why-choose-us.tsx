import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Heart, ShieldCheck } from "lucide-react";

const reasons = [
  {
    title: "Holistic Event Expertise",
    description: "From intimate gatherings to large-scale productions, we deliver events with precision and creativity.",
    icon: <ShieldCheck className="w-8 h-8 text-secondary" />
  },
  {
    title: "Modern Aesthetic, Cultural Sensitivity",
    description: "Indian weddings, regional rituals, corporate branding—we understand them deeply and execute with style.",
    icon: <Heart className="w-8 h-8 text-secondary" />
  },
  {
    title: "End-to-End Planning",
    description: "Planning, design, vendors, logistics, hospitality—we handle everything under one umbrella.",
    icon: <CheckCircle2 className="w-8 h-8 text-secondary" />
  },
  {
    title: "Flawless Execution",
    description: "Clear communication, transparent processes, and a dedicated team for every event.",
    icon: <Lightbulb className="w-8 h-8 text-secondary" />
  }
];

import { useBranding } from "@/contexts/BrandingContext";

export function WhyChooseUs() {
  const { branding } = useBranding();
  
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Why Choose Us?</span>
          <h2 className="font-serif text-3xl md:text-4xl">The {branding.company.name} Standard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="mb-6 bg-primary-foreground/10 w-16 h-16 rounded-full flex items-center justify-center">
                {reason.icon}
              </div>
              <h3 className="font-serif text-xl mb-4">{reason.title}</h3>
              <p className="text-white/70 font-light text-sm leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
