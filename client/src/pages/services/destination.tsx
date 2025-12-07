import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Star, 
  Plane,
  Sparkles,
  Quote,
  Hotel,
  Car,
  Gift,
  Globe,
  Calendar,
  Users
} from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/destination_event_beach.png";
import { SEOHead, getServiceSchema, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

function getStats(branding: any) {
  return [
    { value: `${branding.stats.destinationsCount}+`, label: "Destinations", icon: MapPin },
    { value: `${branding.stats.eventsCompleted}+`, label: "Destination Events", icon: Calendar },
    { value: `${branding.stats.yearsExperience}+`, label: "Years Experience", icon: Globe },
    { value: "100%", label: "Logistics Managed", icon: Plane },
  ];
}

const services = [
  {
    icon: MapPin,
    title: "Venue Sourcing",
    description: "Handpicked palaces, resorts, beaches, and unique venues worldwide"
  },
  {
    icon: Plane,
    title: "Travel Coordination",
    description: "Group flights, transfers, and travel management for all guests"
  },
  {
    icon: Hotel,
    title: "Accommodation",
    description: "Room blocks, hotel coordination, and guest management"
  },
  {
    icon: Car,
    title: "Ground Transport",
    description: "Airport transfers, event shuttles, and VIP transportation"
  },
  {
    icon: Users,
    title: "Guest Management",
    description: "Hospitality desks, itinerary planning, and concierge services"
  },
  {
    icon: Gift,
    title: "Welcome Experience",
    description: "Custom welcome hampers, arrival surprises, and local experiences"
  },
];

const destinations = {
  india: [
    { name: "Udaipur", desc: "Lake palaces and royal venues" },
    { name: "Jaipur", desc: "Heritage forts and colorful celebrations" },
    { name: "Goa", desc: "Beach weddings and sunset ceremonies" },
    { name: "Kerala", desc: "Backwater elegance and tropical beauty" },
    { name: "Jodhpur", desc: "Mehrangarh magic and blue city charm" },
    { name: "Rishikesh", desc: "Spiritual retreats by the Ganges" },
  ],
  international: [
    { name: "Dubai, UAE", desc: "Luxury and grandeur" },
    { name: "Thailand", desc: "Beach resorts and islands" },
    { name: "Bali, Indonesia", desc: "Tropical paradise weddings" },
    { name: "Italy", desc: "Tuscan villas and romance" },
    { name: "Maldives", desc: "Overwater celebrations" },
    { name: "Sri Lanka", desc: "Cultural and beach events" },
  ],
};

const processSteps = [
  { step: "01", title: "Destination Selection", desc: "Finding the perfect location for your event" },
  { step: "02", title: "Site Visit", desc: "On-ground venue inspection and planning" },
  { step: "03", title: "Logistics Setup", desc: "Travel, accommodation, and vendor coordination" },
  { step: "04", title: "Execution", desc: "Seamless event delivery at your chosen destination" },
];

export default function DestinationPage() {
  const { branding } = useBranding();
  
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="destination"
        canonicalUrl={`${branding.domain.url}/services/destination`}
        structuredData={{
          ...getServiceSchema(branding, "Destination Event Planning", `${branding.domain.url}/services/destination`),
          ...getBreadcrumbSchema(branding, [
            { name: "Home", url: branding.domain.url },
            { name: "Services", url: `${branding.domain.url}/services` },
            { name: "Destination Events", url: `${branding.domain.url}/services/destination` }
          ])
        }}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Destination Events" className="w-full h-full object-cover" />
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
              Celebrations Without Borders
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-page-title">
              Destination Events
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Pan-India and international event planning with complete logistics and hospitality management. Your dream destination awaits.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-plan-destination">
                Plan Your Destination Event
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
              {getStats(branding).map((stat, index) => (
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
                <img 
                  src="https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=1935&auto=format&fit=crop" 
                  alt="Destination Event" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#d4af37]/20 rounded-2xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#601a29]/10 rounded-full -z-10" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Expert Logistics</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Celebrations Without Borders</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Dreaming of a beach wedding in Goa or a palace wedding in Udaipur? {branding.company.name} specializes in logistical mastery for destination events, ensuring a seamless experience for you and your traveling guests.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We handle everything from venue sourcing to guest management, leaving you free to enjoy your celebration in your dream location.
              </p>
              <ul className="space-y-3">
                {["Complete Travel Management", "On-Ground Coordination", "Local Vendor Network", "Guest Hospitality Services"].map((item, i) => (
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Destination Event Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete destination event management from start to finish
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

      {/* Destinations */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Where We Go</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Popular Destinations</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              From royal palaces to tropical beaches, we plan events across the globe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#d4af37]" />
                India
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {destinations.india.map((dest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors"
                  >
                    <h4 className="font-semibold mb-1">{dest.name}</h4>
                    <p className="text-white/60 text-sm">{dest.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#d4af37]" />
                International
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {destinations.international.map((dest, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors"
                  >
                    <h4 className="font-semibold mb-1">{dest.name}</h4>
                    <p className="text-white/60 text-sm">{dest.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
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
                D
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Deepak & Neha Gupta</h3>
                <p className="text-[#601a29] text-sm">Destination Wedding, Phuket</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
              ))}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              "Our Thailand wedding was a dream come true thanks to {branding.company.name}. Managing a destination wedding with 150 guests seemed daunting, but they made it look effortless. Every moment was perfect, and our guests still talk about the experience!"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Your Dream Destination?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Let's plan an unforgettable celebration in a location that inspires you.
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
