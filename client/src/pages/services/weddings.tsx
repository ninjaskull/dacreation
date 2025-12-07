import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Star, 
  Calendar, 
  Users, 
  Award,
  Sparkles,
  Quote,
  Camera,
  Music,
  Palette,
  Gift
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@assets/generated_images/indian_bride_and_groom_minimalist.png";
import decorImg from "@assets/generated_images/indian_wedding_decor_detail.png";
import { SEOHead, SEO_DATA, getServiceSchema, getBreadcrumbSchema } from "@/components/seo/SEOHead";

interface WebsiteSettings {
  weddingsCount: number;
  corporateCount: number;
  socialCount: number;
  awardsCount: number;
}

const services = [
  {
    icon: Calendar,
    title: "Full Wedding Planning",
    description: "From engagement to reception, we handle every detail of your celebration"
  },
  {
    icon: Palette,
    title: "Design & Decor",
    description: "Stunning stage, mandap, sangeet setups tailored to your vision"
  },
  {
    icon: Music,
    title: "Entertainment Curation",
    description: "DJs, live bands, choreographers, and unique performance acts"
  },
  {
    icon: Camera,
    title: "Vendor Management",
    description: "Photography, catering, makeup - we coordinate it all seamlessly"
  },
  {
    icon: Users,
    title: "Guest Management",
    description: "RSVP tracking, hospitality desks, and guest experience"
  },
  {
    icon: Gift,
    title: "Trousseau & Gifts",
    description: "Beautiful packing and curated gift hampers for your loved ones"
  },
];

const weddingTypes = [
  { name: "Hindu Weddings", desc: "Traditional ceremonies with modern elegance" },
  { name: "Sikh Weddings", desc: "Sacred Anand Karaj celebrations" },
  { name: "Muslim Weddings", desc: "Beautiful Nikah ceremonies" },
  { name: "Christian Weddings", desc: "Church and outdoor celebrations" },
  { name: "Inter-faith Weddings", desc: "Blending traditions beautifully" },
  { name: "Court Marriages", desc: "Elegant legal ceremonies" },
];

const processSteps = [
  { step: "01", title: "Discovery", desc: "We learn about your vision, preferences, and budget" },
  { step: "02", title: "Planning", desc: "Detailed timeline, vendor selection, and logistics" },
  { step: "03", title: "Design", desc: "Creating stunning decor concepts and layouts" },
  { step: "04", title: "Execution", desc: "Flawless on-ground coordination and management" },
];

export default function WeddingsPage() {
  const { data: websiteSettings } = useQuery<WebsiteSettings>({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { weddingsCount: 0, corporateCount: 0, socialCount: 0, awardsCount: 0 };
      return res.json();
    },
  });

  const stats = [
    { value: `${websiteSettings?.weddingsCount || 0}+`, label: "Weddings Planned", icon: Heart },
    { value: "15+", label: "Years Experience", icon: Calendar },
    { value: "98%", label: "Happy Couples", icon: Star },
    { value: "50+", label: "Destinations", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={SEO_DATA.weddings.title}
        description={SEO_DATA.weddings.description}
        keywords={SEO_DATA.weddings.keywords}
        canonicalUrl="https://dacreation.in/services/weddings"
        structuredData={{
          ...getServiceSchema("Wedding Planning", SEO_DATA.weddings.description, "https://dacreation.in/services/weddings"),
          ...getBreadcrumbSchema([
            { name: "Home", url: "https://dacreation.in" },
            { name: "Services", url: "https://dacreation.in/services" },
            { name: "Weddings", url: "https://dacreation.in/services/weddings" }
          ])
        }}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Weddings" className="w-full h-full object-cover" />
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
              Wedding Planning Excellence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
              Weddings & Cultural Celebrations
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Modern design meets rich Indian tradition. We plan every ritual, ceremony, and moment effortlessly to create your perfect day.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-plan-wedding">
                Plan Your Dream Wedding
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
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">The DA Creation Way</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">The Wedding Experience</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We understand that an Indian wedding is not just an event, but a union of families and a celebration of heritage. At DA Creation, we respect the sanctity of traditions while infusing them with a contemporary aesthetic.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                From the mehendi ceremony to the bidaai, we ensure every moment is crafted with love, precision, and cultural sensitivity.
              </p>
              <ul className="space-y-3">
                {["Full Wedding Planning & Coordination", "Multi-faith Ceremony Expertise", "Luxury Decor & Styling", "Complete Vendor Network"].map((item, i) => (
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
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img src={decorImg} alt="Wedding Decor" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#d4af37]/20 rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#601a29]/10 rounded-full -z-10" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Our Wedding Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive wedding planning services to make your special day perfect
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

      {/* Wedding Types */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Expertise</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Weddings We Plan</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              We have experience planning all types of weddings with cultural sensitivity and expertise
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {weddingTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors border border-white/10"
              >
                <h3 className="font-bold text-lg mb-2">{type.name}</h3>
                <p className="text-white/60 text-sm">{type.desc}</p>
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
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">How We Work</span>
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
                P
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Priya & Rahul Sharma</h3>
                <p className="text-[#601a29] text-sm">Wedding, December 2024</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
              ))}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              "DA Creation transformed our wedding into a fairy tale. Every detail was perfect, from the mandap decoration to the reception setup. They handled everything with such grace and professionalism. We couldn't have asked for a better team to make our special day unforgettable."
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Plan Your Dream Wedding?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss how we can make your special day truly unforgettable.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-start-planning">
                Start Planning Today
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
