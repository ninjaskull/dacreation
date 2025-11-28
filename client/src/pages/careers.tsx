import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Career } from "@shared/schema";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign,
  Users,
  Heart,
  Award,
  Sparkles,
  Zap,
  Coffee,
  GraduationCap,
  Globe,
  Gift
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const benefits = [
  { icon: Heart, title: "Health Insurance", desc: "Comprehensive health coverage for you and family" },
  { icon: Gift, title: "Performance Bonus", desc: "Rewarding excellence and dedication" },
  { icon: GraduationCap, title: "Learning Budget", desc: "Annual allowance for professional development" },
  { icon: Coffee, title: "Flexible Hours", desc: "Work-life balance that works for you" },
  { icon: Globe, title: "Travel Opportunities", desc: "Experience events across India and abroad" },
  { icon: Zap, title: "Fast Growth", desc: "Rapid career progression opportunities" },
];

const cultureHighlights = [
  { 
    icon: Users, 
    title: "Collaborative Culture", 
    desc: "Work with passionate, creative individuals who support each other's growth"
  },
  { 
    icon: Sparkles, 
    title: "Creative Freedom", 
    desc: "Your ideas matter here. We encourage innovation and creative thinking"
  },
  { 
    icon: Award, 
    title: "Recognition & Rewards", 
    desc: "We celebrate achievements and reward exceptional performance"
  },
];

const defaultCareers = [
  {
    id: 1,
    title: "Senior Event Manager",
    department: "Event Operations",
    location: "Mumbai",
    type: "Full-time",
    experience: "5-7 years",
    salary: "12-18 LPA",
    description: "Lead and execute large-scale events, manage client relationships, and mentor junior team members. You'll be responsible for end-to-end event management including budgeting, vendor coordination, and on-ground execution.",
    requirements: [
      "5+ years of event management experience",
      "Strong leadership and communication skills",
      "Experience with budget management",
      "Ability to handle high-pressure situations",
      "Willingness to travel for events"
    ],
    benefits: [
      "Competitive salary with performance bonuses",
      "Health insurance for family",
      "Annual learning allowance",
      "Flexible working hours"
    ],
    applicationEmail: "careers@dacreation.in",
    isActive: true,
  },
  {
    id: 2,
    title: "Creative Designer",
    department: "Design & Decor",
    location: "Mumbai",
    type: "Full-time",
    experience: "3-5 years",
    salary: "8-12 LPA",
    description: "Create stunning visual concepts for events, including decor designs, 3D renders, and presentation materials. Work closely with clients to bring their vision to life.",
    requirements: [
      "Proficiency in Adobe Creative Suite",
      "Experience with 3D visualization tools",
      "Strong portfolio of event design work",
      "Creative thinking and attention to detail"
    ],
    benefits: [
      "Creative freedom and expression",
      "Latest design tools and software",
      "Opportunity to work on premium events"
    ],
    applicationEmail: "careers@dacreation.in",
    isActive: true,
  },
  {
    id: 3,
    title: "Event Coordinator",
    department: "Event Operations",
    location: "Delhi NCR",
    type: "Full-time",
    experience: "1-3 years",
    salary: "4-6 LPA",
    description: "Support event managers in planning and executing events. Handle vendor coordination, logistics, and on-site event management.",
    requirements: [
      "1+ years in event industry",
      "Excellent organizational skills",
      "Strong communication abilities",
      "Flexibility to work weekends"
    ],
    benefits: [
      "Mentorship from senior professionals",
      "Hands-on experience with premium events",
      "Fast-track career growth"
    ],
    applicationEmail: "careers@dacreation.in",
    isActive: true,
  },
];

type CareerDisplayItem = {
  id: number | string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience?: string | null;
  salary?: string | null;
  description?: string;
  requirements?: string[] | null;
  benefits?: string[] | null;
  applicationEmail?: string | null;
  isActive?: boolean;
};

export default function CareersPage() {
  const [selectedCareer, setSelectedCareer] = useState<CareerDisplayItem | null>(null);
  
  const { data: careers = [], isLoading } = useQuery<CareerDisplayItem[]>({
    queryKey: ["/api/cms/careers", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/careers?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item: Career): CareerDisplayItem => ({
        id: item.id,
        title: item.title,
        department: item.department,
        location: item.location,
        type: item.type,
        experience: item.experience,
        salary: item.salary,
        description: item.description,
        requirements: item.requirements,
        benefits: item.benefits,
        applicationEmail: item.applicationEmail,
        isActive: item.isActive,
      }));
    },
  });

  const displayCareers: CareerDisplayItem[] = careers.length > 0 ? careers : defaultCareers;
  const departments = Array.from(new Set(displayCareers.map(c => c.department)));

  return (
    <div className="min-h-screen bg-white">
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
              Join Our Team
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              Careers at DA Creation
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Build your career with India's leading event management company and be part of creating unforgettable moments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 bg-white relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {cultureHighlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#601a29] to-[#7a2233] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Why Join Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Benefits & Perks</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We believe in taking care of our team. Here's what you can expect when you join DA Creation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-[#601a29]/20 transition-all group"
              >
                <div className="w-12 h-12 bg-[#601a29]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#601a29] transition-colors">
                  <benefit.icon className="w-6 h-6 text-[#601a29] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Opportunities</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Open Positions</h2>
          </motion.div>
          
          {isLoading ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : displayCareers.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              {departments.map((dept) => (
                <div key={dept} className="mb-10">
                  <h3 className="text-lg font-semibold text-[#601a29] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    {dept}
                  </h3>
                  <div className="space-y-4">
                    {displayCareers
                      .filter(c => c.department === dept)
                      .map((career, index) => (
                        <motion.div
                          key={career.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#601a29]/20 transition-all cursor-pointer group"
                          onClick={() => setSelectedCareer(career)}
                          data-testid={`card-career-${career.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#601a29] transition-colors">
                                {career.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-[#601a29]" />
                                  {career.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4 text-[#601a29]" />
                                  {career.type}
                                </span>
                                {career.experience && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-[#601a29]" />
                                    {career.experience}
                                  </span>
                                )}
                                {career.salary && (
                                  <span className="flex items-center gap-1 font-medium text-[#601a29]">
                                    <DollarSign className="w-4 h-4" />
                                    {career.salary}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="hidden md:block text-sm text-gray-500 group-hover:text-[#601a29]">View Details</span>
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#601a29] group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl max-w-4xl mx-auto">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No open positions at the moment.</p>
              <p className="text-gray-400 mb-6">Check back soon or send us your resume for future opportunities.</p>
              <a href="mailto:careers@dacreation.in">
                <Button variant="outline" className="rounded-full gap-2">
                  Send Your Resume
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* General Application CTA */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't See a Suitable Role?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send us your resume and we'll reach out when a suitable opportunity arises.
            </p>
            <a
              href="mailto:careers@dacreation.in"
              data-testid="link-email-careers"
            >
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white">
                Send Your Resume
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Career Detail Dialog */}
      <Dialog open={!!selectedCareer} onOpenChange={() => setSelectedCareer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCareer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedCareer.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-[#601a29]/10 text-[#601a29] rounded-full text-sm font-medium">
                    {selectedCareer.department}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-[#601a29]" />
                    {selectedCareer.location}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 text-[#601a29]" />
                    {selectedCareer.type}
                  </span>
                  {selectedCareer.experience && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#601a29]" />
                      {selectedCareer.experience}
                    </span>
                  )}
                  {selectedCareer.salary && (
                    <span className="flex items-center gap-1 text-sm font-medium text-[#601a29]">
                      <DollarSign className="w-4 h-4" />
                      {selectedCareer.salary}
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About the Role</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedCareer.description}</p>
                </div>
                
                {selectedCareer.requirements && selectedCareer.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {selectedCareer.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle2 className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedCareer.benefits && selectedCareer.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What We Offer</h4>
                    <ul className="space-y-2">
                      {selectedCareer.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle2 className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <a
                    href={`mailto:${selectedCareer.applicationEmail || 'careers@dacreation.in'}?subject=Application for ${selectedCareer.title}`}
                  >
                    <Button className="w-full rounded-full gap-2" data-testid="button-apply">
                      Apply for This Position
                      <ArrowRight className="w-4 h-4" />
                    </Button>
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
