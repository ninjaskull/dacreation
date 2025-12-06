import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  PartyPopper, 
  Star, 
  Users, 
  Cake,
  Sparkles,
  Quote,
  Heart,
  Gift,
  Music,
  Camera,
  Utensils,
  Baby
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@assets/generated_images/luxury_private_dinner.png";
import { SEOHead, SEO_DATA, getServiceSchema, getBreadcrumbSchema } from "@/components/seo/SEOHead";

interface WebsiteSettings {
  weddingsCount: number;
  corporateCount: number;
  socialCount: number;
  awardsCount: number;
}

const services = [
  {
    icon: Cake,
    title: "Birthday Celebrations",
    description: "Milestone birthdays with personalized themes and unforgettable moments"
  },
  {
    icon: Heart,
    title: "Anniversary Parties",
    description: "Celebrating years of love with elegant and memorable events"
  },
  {
    icon: Baby,
    title: "Baby Showers",
    description: "Welcoming new arrivals with beautiful celebrations"
  },
  {
    icon: Gift,
    title: "Proposal Planning",
    description: "Romantic and creative proposals that lead to 'Yes!'"
  },
  {
    icon: Utensils,
    title: "Private Dinners",
    description: "Intimate luxury dining experiences in stunning settings"
  },
  {
    icon: Music,
    title: "Theme Parties",
    description: "Creative themed celebrations with entertainment and decor"
  },
];

const occasions = [
  { name: "Milestone Birthdays", desc: "1st, 18th, 25th, 50th, and more" },
  { name: "Silver & Golden Anniversaries", desc: "25th and 50th celebrations" },
  { name: "Baby Showers & Naming", desc: "Welcoming new family members" },
  { name: "Engagement Celebrations", desc: "Ring ceremonies and parties" },
  { name: "Retirement Parties", desc: "Celebrating career milestones" },
  { name: "Housewarming Events", desc: "New home celebrations" },
];

const processSteps = [
  { step: "01", title: "Vision", desc: "Understanding your celebration ideas and preferences" },
  { step: "02", title: "Design", desc: "Creating a unique theme and experience" },
  { step: "03", title: "Curate", desc: "Selecting vendors, menu, and entertainment" },
  { step: "04", title: "Celebrate", desc: "Seamless execution while you enjoy" },
];

export default function SocialPage() {
  const { data: websiteSettings } = useQuery<WebsiteSettings>({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { weddingsCount: 0, corporateCount: 0, socialCount: 0, awardsCount: 0 };
      return res.json();
    },
  });

  const stats = [
    { value: `${websiteSettings?.socialCount || 0}+`, label: "Social Events", icon: PartyPopper },
    { value: "100%", label: "Custom Themes", icon: Sparkles },
    { value: "5000+", label: "Happy Guests", icon: Users },
    { value: "4.9/5", label: "Client Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={SEO_DATA.social.title}
        description={SEO_DATA.social.description}
        keywords={SEO_DATA.social.keywords}
        canonicalUrl="https://dacreation.com/services/social"
        structuredData={{
          ...getServiceSchema("Social Event Planning", SEO_DATA.social.description, "https://dacreation.com/services/social"),
          ...getBreadcrumbSchema([
            { name: "Home", url: "https://dacreation.com" },
            { name: "Services", url: "https://dacreation.com/services" },
            { name: "Social Events", url: "https://dacreation.com/services/social" }
          ])
        }}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Social Events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              Celebrate Life's Moments
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
              Social Events & Private Parties
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Birthdays, anniversaries, baby showers, proposals, and everything worth celebrating. We add magic to your moments.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-plan-party">
                Plan Your Celebration
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#601a29] to-[#7a2233] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-[#601a29] mb-1">
                    {stat.value}
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Personal Touch</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Intimate Gatherings, Grand Memories</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Whether it's a milestone birthday or a cozy family gathering, DA Creation adds a touch of magic to your personal celebrations. We handle the details so you can be a guest at your own party.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                From conceptualization to execution, we create bespoke experiences that reflect your personality and exceed expectations.
              </p>
              <ul className="space-y-3">
                {["Personalized Theme Design", "Complete Event Coordination", "Vendor & Venue Management", "On-Day Event Direction"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#601a29] to-[#d4af37]">
                <img 
                  src="https://images.unsplash.com/photo-1530103862676-de3c9a59af57?q=80&w=2070&auto=format&fit=crop" 
                  alt="Party Celebration" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#d4af37]/20 rounded-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#601a29]/10 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Our Social Event Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From intimate dinners to grand celebrations, we create memorable experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-[#601a29]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#601a29] transition-colors">
                  <service.icon className="w-7 h-7 text-[#601a29] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Celebrations We Plan</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Special Occasions</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Every milestone deserves a memorable celebration
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {occasions.map((occasion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors border border-white/10"
              >
                <h3 className="font-bold text-lg mb-2">{occasion.name}</h3>
                <p className="text-white/60 text-sm">{occasion.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Our Process</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {processSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="text-5xl font-bold text-[#601a29]/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#601a29]/20 to-transparent -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 relative"
          >
            <Quote className="absolute top-8 right-8 w-16 h-16 text-[#d4af37]/10" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white text-xl font-bold">
                A
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Anjali Kapoor</h3>
                <p className="text-[#601a29] text-sm">Golden Anniversary Celebration</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
              ))}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              "The team at DA Creation made my parents' 50th anniversary a magical evening. The vintage theme was executed beautifully, and every guest complimented the arrangements. Thank you for making it so special!"
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Celebrate?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Let's create a celebration that reflects your style and leaves lasting memories.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-start-planning">
                Start Planning
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Contact />
      <Footer />
    </div>
  );
}
