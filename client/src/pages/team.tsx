import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import { Linkedin, Instagram, Mail, Phone } from "lucide-react";

export default function TeamPage() {
  const { data: teamMembers, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/cms/team", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/team?active=true");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="relative py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
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
              Our Team
            </h1>
            <p className="text-xl text-white/80">
              Meet the passionate professionals behind DA Creation's success
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-8 animate-pulse">
                  <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-6" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow group"
                  data-testid={`card-team-member-${member.id}`}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold overflow-hidden group-hover:scale-105 transition-transform">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#601a29] font-medium mb-4">{member.role}</p>
                  
                  {member.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                  )}
                  
                  <div className="flex items-center justify-center gap-3 mt-4">
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#601a29] hover:text-white transition-colors"
                        data-testid={`link-email-${member.id}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {member.phone && (
                      <a 
                        href={`tel:${member.phone}`}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#601a29] hover:text-white transition-colors"
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
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#0077b5] hover:text-white transition-colors"
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
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#515bd4] hover:text-white transition-colors"
                        data-testid={`link-instagram-${member.id}`}
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No team members found.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
