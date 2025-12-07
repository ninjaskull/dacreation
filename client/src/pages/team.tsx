import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import { 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  Users, 
  Heart, 
  Award,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

const departments = [
  { name: "Leadership", description: "Visionary leaders guiding our success" },
  { name: "Planning", description: "Master planners orchestrating every detail" },
  { name: "Design", description: "Creative minds crafting beautiful experiences" },
  { name: "Operations", description: "Experts ensuring flawless execution" },
];

const cultureValues = [
  { 
    icon: Heart, 
    title: "Passion-Driven", 
    description: "We love what we do, and it shows in every event we create."
  },
  { 
    icon: Users, 
    title: "Collaborative", 
    description: "Great ideas come from working together as one team."
  },
  { 
    icon: Award, 
    title: "Excellence-Focused", 
    description: "We never settle for good enough – we strive for extraordinary."
  },
];

export default function TeamPage() {
  const { branding } = useBranding();
  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
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
        pageType="team"
        canonicalUrl={`${branding.domain.url}/team`}
        structuredData={getBreadcrumbSchema(branding, [
          { name: "Home", url: branding.domain.url },
          { name: "Our Team", url: `${branding.domain.url}/team` }
        ])}
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
              The People Behind the Magic
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              Our Team
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Meet the passionate professionals who transform your dreams into extraordinary celebrations
            </p>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 bg-white relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {cultureValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#601a29] to-[#7a2233] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Who We Are</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">A Team United by Passion</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At DA Creation, our team is our greatest asset. Each member brings unique skills, creativity, and dedication to ensure every event we create is nothing short of exceptional.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                From seasoned planners to creative designers, logistics experts to hospitality specialists, we work together seamlessly to bring your vision to life.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-3xl font-bold text-[#601a29]">50+</p>
                  <p className="text-gray-600 text-sm">Team Members</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-3xl font-bold text-[#601a29]">15+</p>
                  <p className="text-gray-600 text-sm">Years Experience</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-3xl font-bold text-[#601a29]">4</p>
                  <p className="text-gray-600 text-sm">Departments</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {departments.map((dept, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#601a29]/20 transition-all"
                >
                  <h3 className="font-bold text-gray-900 mb-1">{dept.name}</h3>
                  <p className="text-gray-500 text-sm">{dept.description}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Our Experts</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Meet the Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every member of our team is committed to making your event extraordinary
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-8 animate-pulse">
                  <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-6" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  data-testid={`card-team-member-${member.id}`}
                >
                  <div className="bg-gradient-to-br from-[#601a29]/5 to-[#d4af37]/5 p-8 text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] mx-auto flex items-center justify-center text-white text-4xl font-bold overflow-hidden group-hover:scale-105 transition-transform shadow-lg">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-[#601a29] font-medium mb-4">{member.role}</p>
                    
                    {member.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                    )}
                    
                    <div className="flex items-center justify-center gap-3">
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#601a29] hover:text-white transition-colors"
                          data-testid={`link-email-${member.id}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {member.phone && (
                        <a 
                          href={`tel:${member.phone}`}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#601a29] hover:text-white transition-colors"
                          data-testid={`link-phone-${member.id}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a 
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0077b5] hover:text-white transition-colors"
                          data-testid={`link-linkedin-${member.id}`}
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.instagram && (
                        <a 
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#515bd4] hover:text-white transition-colors"
                          data-testid={`link-instagram-${member.id}`}
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Our team is growing!</p>
              <p className="text-gray-400">Check back soon to meet our amazing team members.</p>
            </div>
          )}
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Team</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Are you passionate about creating unforgettable events? We're always looking for talented individuals to join our growing family.
            </p>
            <Link href="/careers">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-view-careers">
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
