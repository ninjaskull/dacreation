import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { PageContent, TeamMember } from "@shared/schema";
import { Users, Award, Calendar, Star, Heart } from "lucide-react";
import { Link } from "wouter";

const stats = [
  { icon: Calendar, value: "15+", label: "Years of Experience" },
  { icon: Heart, value: "1000+", label: "Events Managed" },
  { icon: Users, value: "50+", label: "Team Members" },
  { icon: Star, value: "98%", label: "Client Satisfaction" },
];

export default function AboutPage() {
  const { data: pageContent } = useQuery<PageContent>({
    queryKey: ["/api/cms/pages/about"],
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
      <Navbar />
      
      <section className="relative pt-32 lg:pt-40 pb-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              {pageContent?.title || "About DA Creation"}
            </h1>
            <p className="text-xl text-white/80">
              {pageContent?.subtitle || "Crafting Unforgettable Moments Since 2009"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
                <div className="w-14 h-14 bg-[#601a29]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-[#601a29]" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#601a29] mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  {pageContent?.content || `Founded in 2009, DA Creation has grown from a passionate vision to one of India's most trusted event management companies. We believe that every event tells a story, and our mission is to make that story unforgettable.`}
                </p>
                <p>
                  From intimate gatherings to grand celebrations, we bring creativity, precision, and heart to every project. Our team of dedicated professionals works tirelessly to transform your dreams into stunning reality.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#601a29] to-[#d4af37] overflow-hidden shadow-xl">
                <img 
                  src={pageContent?.heroImage || "/Da creation/DA CREATION  LOGO.webp"} 
                  alt="DA Creation"
                  className="w-full h-full object-contain p-12 bg-white/95"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Excellence", desc: "We pursue perfection in every detail, ensuring each event exceeds expectations." },
              { title: "Creativity", desc: "Innovation drives us to create unique experiences that stand out and inspire." },
              { title: "Integrity", desc: "Transparency and honesty form the foundation of all our client relationships." },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <Award className="w-10 h-10 text-[#d4af37] mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {teamMembers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The talented individuals behind DA Creation's success
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
                  className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-team-member-${member.id}`}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
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
              <div className="text-center mt-8">
                <Link href="/team" className="inline-flex items-center gap-2 text-[#601a29] hover:text-[#d4af37] font-semibold transition-colors">
                  View All Team Members
                  <span>&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-16 bg-[#601a29] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Perfect Event?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can bring your vision to life with our expertise and passion.
            </p>
            <Link href="/inquire">
              <button
                className="bg-[#d4af37] hover:bg-[#c5a030] text-white px-8 py-3 rounded-full font-semibold transition-colors"
                data-testid="button-cta-inquire"
              >
                Start Planning Your Event
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
