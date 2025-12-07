import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Heart, ShieldCheck, Building2, Target, Clock, Award } from "lucide-react";

const reasons = [
  {
    title: "Holistic Event Expertise",
    description: "From intimate gatherings to large-scale corporate productions, we deliver events with precision and creativity.",
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

const corporateAdvantages = [
  {
    title: "ROI-Focused Planning",
    description: "Every corporate event is designed to achieve measurable business objectives and lasting impact.",
    icon: <Target className="w-6 h-6 text-secondary" />
  },
  {
    title: "On-Time Delivery",
    description: "Strict adherence to timelines and deadlines that corporate clients expect and deserve.",
    icon: <Clock className="w-6 h-6 text-secondary" />
  },
  {
    title: "Brand Alignment",
    description: "Events that seamlessly integrate your brand identity, messaging, and corporate values.",
    icon: <Building2 className="w-6 h-6 text-secondary" />
  },
  {
    title: "Professional Standards",
    description: "Enterprise-grade execution with NDAs, proper documentation, and corporate protocols.",
    icon: <Award className="w-6 h-6 text-secondary" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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

        {/* Corporate Excellence Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 md:p-12"
        >
          <div className="text-center mb-10">
            <Building2 className="w-10 h-10 text-secondary mx-auto mb-4" />
            <h3 className="font-serif text-2xl md:text-3xl mb-3">Corporate Event Excellence</h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Trusted by leading companies for conferences, product launches, brand activations, and executive retreats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corporateAdvantages.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="mb-3 bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="font-medium text-white mb-2">{item.title}</h4>
                <p className="text-white/60 text-sm font-light">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <span className="text-3xl md:text-4xl font-bold text-secondary">{branding.stats.corporateCount}+</span>
              <p className="text-white/60 text-sm mt-1">Corporate Events</p>
            </div>
            <div className="w-px h-12 bg-white/20 hidden md:block"></div>
            <div>
              <span className="text-3xl md:text-4xl font-bold text-secondary">{branding.stats.happyClients}+</span>
              <p className="text-white/60 text-sm mt-1">Business Clients</p>
            </div>
            <div className="w-px h-12 bg-white/20 hidden md:block"></div>
            <div>
              <span className="text-3xl md:text-4xl font-bold text-secondary">{branding.stats.clientSatisfaction}%</span>
              <p className="text-white/60 text-sm mt-1">Client Satisfaction</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
