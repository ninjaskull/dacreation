import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { TrustedClients } from "@/components/sections/trusted-clients";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Star, 
  Users, 
  Award,
  Sparkles,
  Quote,
  Presentation,
  Trophy,
  Target,
  Lightbulb,
  Mic,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@assets/generated_images/corporate_conference_stage.png";
import galaImg from "@assets/generated_images/corporate_event_gala.png";
import { SEOHead, getServiceSchema, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

interface WebsiteSettings {
  weddingsCount: number;
  corporateCount: number;
  socialCount: number;
  awardsCount: number;
  showTrustedBy: boolean;
}

const services = [
  {
    icon: Presentation,
    title: "Conferences & Seminars",
    description: "Large-scale conferences with immersive experiences and seamless tech integration"
  },
  {
    icon: Lightbulb,
    title: "Product Launches",
    description: "Impactful brand activations and product reveal experiences"
  },
  {
    icon: Trophy,
    title: "Award Ceremonies",
    description: "Glamorous annual award nights celebrating excellence and achievements"
  },
  {
    icon: Users,
    title: "Team Building",
    description: "Engaging team activities and corporate retreats that inspire"
  },
  {
    icon: Target,
    title: "Brand Activations",
    description: "Interactive experiences that bring your brand story to life"
  },
  {
    icon: Mic,
    title: "Gala Dinners",
    description: "Elegant corporate dinners and networking events"
  },
];

const industries = [
  "Technology & IT",
  "Banking & Finance",
  "Healthcare & Pharma",
  "Manufacturing",
  "FMCG & Retail",
  "Media & Entertainment",
  "Real Estate",
  "Automotive",
];

const processSteps = [
  { step: "01", title: "Brief", desc: "Understanding your brand objectives and event goals" },
  { step: "02", title: "Strategy", desc: "Creating event concept and experience design" },
  { step: "03", title: "Production", desc: "Vendor coordination and technical planning" },
  { step: "04", title: "Execution", desc: "Flawless delivery and real-time management" },
];

export default function CorporatePage() {
  const { branding } = useBranding();
  const { data: websiteSettings } = useQuery<WebsiteSettings>({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { weddingsCount: 0, corporateCount: 0, socialCount: 0, awardsCount: 0, showTrustedBy: false };
      return res.json();
    },
  });

  const stats = [
    { value: `${websiteSettings?.corporateCount || branding.stats.corporateCount}+`, label: "Corporate Events", icon: Building2 },
    { value: `${branding.stats.happyClients}+`, label: "Happy Clients", icon: Award },
    { value: `${branding.stats.eventsCompleted}+`, label: "Events Delivered", icon: Users },
    { value: `${branding.stats.clientSatisfaction}%`, label: "Client Satisfaction", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="corporate"
        canonicalUrl={`${branding.domain.url}/services/corporate`}
        structuredData={{
          ...getServiceSchema(branding, "Corporate Event Management", "Professional corporate event management services including conferences, product launches, award ceremonies, and team building events.", `${branding.domain.url}/services/corporate`),
          ...getBreadcrumbSchema(branding, [
            { name: "Home", url: branding.domain.url },
            { name: "Services", url: `${branding.domain.url}/services` },
            { name: "Corporate Events", url: `${branding.domain.url}/services/corporate` }
          ])
        }}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Corporate Events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              Corporate Excellence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
              Corporate Events
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Professional, polished, and impact-driven events—from conferences to award shows. We elevate your brand presence.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-plan-event">
                Plan Your Corporate Event
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
              className="order-2 md:order-1 relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img src={galaImg} alt="Corporate Gala" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#601a29]/10 rounded-2xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#d4af37]/20 rounded-full -z-10" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Elevating Corporate Experiences</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {branding.company.name} brings strategic thinking and flawless execution to corporate events. We ensure your brand message is delivered effectively through immersive experiences and professional management.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                From Fortune 500 companies to emerging startups, we partner with organizations to create events that inspire, engage, and deliver measurable results.
              </p>
              <ul className="space-y-3">
                {["Strategic Event Planning", "Brand-Aligned Experiences", "End-to-End Execution", "Post-Event Analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                    {item}
                  </li>
                ))}
              </ul>
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
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Our Expertise</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Corporate Event Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions for all your corporate event needs
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

      {/* Trusted Clients - Only show when admin toggle is enabled */}
      {websiteSettings?.showTrustedBy && <TrustedClients variant="light" />}

      {/* Industries */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Industries We Serve</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900">Diverse Industry Experience</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We partner with organizations across diverse industries
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-full px-6 py-3 border border-gray-200 hover:bg-[#601a29] hover:text-white hover:border-[#601a29] transition-colors"
              >
                <span className="font-medium">{industry}</span>
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
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Our Approach</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">How We Work</h2>
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
                V
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Vikram Mehta</h3>
                <p className="text-[#601a29] text-sm">CEO, TechCorp India</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
              ))}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              "We've worked with {branding.company.name} for three consecutive annual conferences, and each one has been better than the last. Their attention to detail and ability to manage complex events is remarkable. Highly recommended for any corporate event."
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Elevate Your Corporate Event?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Let's create an impactful experience that aligns with your brand and engages your audience.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-start-planning">
                Get Started Today
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
