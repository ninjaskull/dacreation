import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TrustedClients } from "@/components/sections/trusted-clients";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { PageContent, TeamMember } from "@shared/schema";
import { 
  Users, 
  Award, 
  Calendar, 
  Star, 
  Heart, 
  Target, 
  Lightbulb, 
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Quote
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, useOrganizationSchema, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

function getStats(branding: any) {
  return [
    { icon: Calendar, value: `${branding.stats.yearsExperience}+`, label: "Years of Experience", description: `Crafting memorable events since ${branding.company.foundedYear}` },
    { icon: Heart, value: `${branding.stats.eventsCompleted}+`, label: "Events Managed", description: "From intimate gatherings to grand celebrations" },
    { icon: Users, value: `${branding.stats.teamMembers}+`, label: "Team Members", description: "Passionate professionals at your service" },
    { icon: Star, value: `${branding.stats.clientSatisfaction}%`, label: "Client Satisfaction", description: "Exceeding expectations every time" },
  ];
}

const values = [
  { 
    icon: Target, 
    title: "Excellence", 
    description: "We pursue perfection in every detail, ensuring each event exceeds expectations and creates lasting impressions."
  },
  { 
    icon: Lightbulb, 
    title: "Creativity", 
    description: "Innovation drives us to create unique experiences that stand out, inspire, and leave guests in awe."
  },
  { 
    icon: Shield, 
    title: "Integrity", 
    description: "Transparency and honesty form the foundation of all our client relationships, building trust that lasts."
  },
  { 
    icon: Heart, 
    title: "Passion", 
    description: "We pour our hearts into every project, treating each event as if it were our own celebration."
  },
];

function getMilestones(companyName: string) {
  return [
    { year: "2020", title: "The Beginning", description: `${companyName} was founded with a vision to transform event experiences in India.` },
    { year: "2021", title: "First Destination Wedding", description: "Executed our first destination wedding in Udaipur, marking a new chapter." },
    { year: "2022", title: "Corporate Division Launch", description: "Expanded into corporate events, partnering with leading companies." },
    { year: "2023", title: "100+ Events Milestone", description: "Celebrated the landmark of successfully executing over 100 events." },
    { year: "2024", title: "Industry Recognition", description: "Awarded Best Event Management Company by Wedding Industry Awards." },
  ];
}

const whyChooseUs = [
  "Dedicated project manager for every event",
  "24/7 support during your celebration",
  "Vendor network of 200+ trusted partners",
  "Customized solutions for every budget",
  "Detailed timeline and checklist management",
  "Post-event coordination and support",
];

export default function AboutPage() {
  const { branding } = useBranding();
  const orgSchema = useOrganizationSchema();
  
  const { data: pageContent } = useQuery<PageContent>({
    queryKey: ["/api/cms/pages/about"],
  });

  const { data: websiteSettings } = useQuery({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { showPreferredBy: true, showTrustedBy: true };
      return res.json();
    },
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/cms/team", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/team?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="about"
        canonicalUrl={`${branding.domain.url}/about`}
        structuredData={{
          ...orgSchema,
          ...getBreadcrumbSchema(branding, [
            { name: "Home", url: branding.domain.url },
            { name: "About Us", url: `${branding.domain.url}/about` }
          ])
        }}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              Our Story
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              About {branding.company.name}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {pageContent?.subtitle || `Crafting Unforgettable Moments Since ${branding.company.foundedYear}`}
            </p>
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
                  <p className="text-gray-900 font-medium">{stat.label}</p>
                  <p className="text-gray-500 text-sm mt-1 hidden md:block">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Who We Are</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Our Story</h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  {pageContent?.content || `Founded in ${branding.company.foundedYear}, ${branding.company.name} has grown from a passionate vision to one of India's most trusted event management companies. We believe that every event tells a story, and our mission is to make that story unforgettable.`}
                </p>
                <p>
                  From intimate gatherings to grand celebrations, we bring creativity, precision, and heart to every project. Our team of dedicated professionals works tirelessly to transform your dreams into stunning reality.
                </p>
                <p>
                  What sets us apart is our deep understanding of Indian traditions combined with contemporary design sensibilities. Whether it's a traditional wedding ceremony or a modern corporate gala, we craft experiences that resonate with meaning and beauty.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/inquire">
                  <Button className="rounded-full gap-2" data-testid="button-cta-story">
                    Start Your Journey
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#601a29] to-[#d4af37] overflow-hidden shadow-2xl">
                  <img 
                    src={pageContent?.heroImage || "/images/logo-maroon.webp"} 
                    alt={branding.company.name}
                    className="w-full h-full object-contain p-12 bg-white"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#d4af37]/20 rounded-2xl -z-10" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#601a29]/10 rounded-full -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#601a29] to-[#7a2233] rounded-2xl p-8 md:p-10 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Sparkles className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed">
                To create extraordinary event experiences that celebrate life's most precious moments, blending cultural heritage with modern elegance to deliver memories that last a lifetime.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 md:p-10 relative overflow-hidden border border-gray-100"
            >
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#601a29]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <Target className="w-10 h-10 text-[#601a29] mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be India's most trusted and innovative event management company, setting new standards of excellence and becoming the first choice for discerning clients seeking unforgettable celebrations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and define who we are
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-[#601a29]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#601a29] group-hover:scale-110 transition-all duration-300">
                  <value.icon className="w-7 h-7 text-[#601a29] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Milestones & Achievements</h2>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#601a29] via-[#d4af37] to-[#601a29]" />
              
              {getMilestones(branding.company.name).map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-20 md:pl-0`}>
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                      <span className="text-[#d4af37] font-bold text-lg">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-[#601a29] rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Why {branding.company.name}</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">What Sets Us Apart</h2>
              <p className="text-white/80 text-lg mb-8">
                With our passion and dedication, we've perfected the art of creating extraordinary events that exceed expectations.
              </p>
              <ul className="space-y-4">
                {whyChooseUs.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                    <span className="text-white/90">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            >
              <Quote className="w-12 h-12 text-[#d4af37] mb-6" />
              <blockquote className="text-xl text-white/90 leading-relaxed mb-6">
                "{branding.company.name} transformed our wedding into a fairy tale. Every detail was perfect, and they handled everything with such grace and professionalism. We couldn't have asked for a better team."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center text-[#601a29] font-bold text-xl">
                  P
                </div>
                <div>
                  <p className="font-semibold">Priya & Rahul Sharma</p>
                  <p className="text-white/60 text-sm">Wedding, 2024</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted Clients */}
      {websiteSettings?.showPreferredBy !== false && <TrustedClients variant="light" />}

      {/* Team Preview */}
      {teamMembers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Our People</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The talented individuals behind {branding.company.name}'s success
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {teamMembers.slice(0, 4).map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all group"
                  data-testid={`card-team-member-${member.id}`}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold overflow-hidden group-hover:scale-105 transition-transform">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-[#601a29]">{member.role}</p>
                </motion.div>
              ))}
            </div>

            {teamMembers.length > 4 && (
              <div className="text-center mt-10">
                <Link href="/team">
                  <Button variant="outline" className="rounded-full gap-2" data-testid="button-view-team">
                    View All Team Members
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.4)_0%,transparent_50%)]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Create Your Perfect Event?</h2>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto text-lg">
                Let's discuss how we can bring your vision to life with our expertise and passion.
              </p>
              <Link href="/inquire">
                <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-cta-inquire">
                  Start Planning Your Event
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
