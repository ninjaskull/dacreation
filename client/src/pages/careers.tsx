import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Career } from "@shared/schema";
import { MapPin, Briefcase, Clock, ArrowRight, CheckCircle2, DollarSign } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CareersPage() {
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  
  const { data: careers = [], isLoading } = useQuery<Career[]>({
    queryKey: ["/api/cms/careers", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/careers?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const departments = Array.from(new Set(careers.map(c => c.department)));

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
              Join Our Team
            </h1>
            <p className="text-xl text-white/80">
              Build your career with India's leading event management company
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: "Growth", desc: "Continuous learning and career advancement opportunities" },
              { title: "Culture", desc: "Collaborative environment with creative freedom" },
              { title: "Impact", desc: "Create memorable experiences that touch lives" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-[#601a29]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-[#d4af37] rounded-full" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Open Positions
          </motion.h2>
          
          {isLoading ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : careers && careers.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {departments.map((dept) => (
                <div key={dept} className="mb-10">
                  <h3 className="text-lg font-semibold text-[#601a29] mb-4 uppercase tracking-wide">
                    {dept}
                  </h3>
                  <div className="space-y-4">
                    {careers
                      .filter(c => c.department === dept)
                      .map((career, index) => (
                        <motion.div
                          key={career.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-[#601a29]/20 transition-all cursor-pointer group"
                          onClick={() => setSelectedCareer(career)}
                          data-testid={`card-career-${career.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#601a29] transition-colors">
                                {career.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {career.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {career.type}
                                </span>
                                {career.experience && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {career.experience}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#601a29] group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">No open positions at the moment.</p>
              <p className="text-gray-400">Check back soon or send us your resume for future opportunities.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Don't see a suitable role?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send your resume to careers@dacreation.in
            </p>
            <a
              href="mailto:careers@dacreation.in"
              className="inline-flex items-center gap-2 bg-[#601a29] hover:bg-[#4a1320] text-white px-6 py-3 rounded-full font-semibold transition-colors"
              data-testid="link-email-careers"
            >
              Send Your Resume
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!selectedCareer} onOpenChange={() => setSelectedCareer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCareer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCareer.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#601a29]" />
                    {selectedCareer.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-[#601a29]" />
                    {selectedCareer.type}
                  </span>
                  {selectedCareer.experience && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#601a29]" />
                      {selectedCareer.experience}
                    </span>
                  )}
                  {selectedCareer.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-[#601a29]" />
                      {selectedCareer.salary}
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedCareer.description}</p>
                </div>
                
                {selectedCareer.requirements && selectedCareer.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <ul className="space-y-2">
                      {selectedCareer.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedCareer.benefits && selectedCareer.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                    <ul className="space-y-2">
                      {selectedCareer.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <a
                    href={`mailto:${selectedCareer.applicationEmail || 'careers@dacreation.in'}?subject=Application for ${selectedCareer.title}`}
                    className="inline-flex items-center gap-2 bg-[#601a29] hover:bg-[#4a1320] text-white px-6 py-3 rounded-full font-semibold transition-colors w-full justify-center"
                    data-testid="button-apply"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
