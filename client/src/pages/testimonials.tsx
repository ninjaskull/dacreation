import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";
import { Star, Quote, Play, Heart, Award, Users, ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, SEO_DATA, getBreadcrumbSchema } from "@/components/seo/SEOHead";

interface WebsiteSettings {
  weddingsCount: number;
  corporateCount: number;
  socialCount: number;
  awardsCount: number;
  ratings: number;
}

const defaultTestimonials = [
  {
    id: 1,
    clientName: "Priya & Rahul Sharma",
    clientRole: "Wedding Couple",
    eventType: "Wedding",
    content: "DA Creation transformed our wedding into a fairy tale. Every detail was perfect, from the mandap decoration to the reception setup. They handled everything with such grace and professionalism. We couldn't have asked for a better team to make our special day unforgettable.",
    rating: 5,
    image: null,
    videoUrl: null,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 2,
    clientName: "Vikram Mehta",
    clientRole: "CEO, TechCorp India",
    eventType: "Corporate Event",
    content: "We've worked with DA Creation for three consecutive annual conferences, and each one has been better than the last. Their attention to detail and ability to manage complex events is remarkable. Highly recommended for any corporate event.",
    rating: 5,
    image: null,
    videoUrl: null,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 3,
    clientName: "Anjali Kapoor",
    clientRole: "Event Host",
    eventType: "Anniversary Celebration",
    content: "The team at DA Creation made my parents' 50th anniversary a magical evening. The vintage theme was executed beautifully, and every guest complimented the arrangements. Thank you for making it so special!",
    rating: 5,
    image: null,
    videoUrl: null,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 4,
    clientName: "Deepak & Neha Gupta",
    clientRole: "Wedding Couple",
    eventType: "Destination Wedding",
    content: "Our Thailand wedding was a dream come true thanks to DA Creation. Managing a destination wedding with 150 guests seemed daunting, but they made it look effortless. Every moment was perfect.",
    rating: 5,
    image: null,
    videoUrl: null,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 5,
    clientName: "Ritu Agarwal",
    clientRole: "HR Director",
    eventType: "Corporate Gala",
    content: "The awards night organized by DA Creation was spectacular. Professional setup, flawless coordination, and an atmosphere that left everyone impressed. They truly understand corporate events.",
    rating: 5,
    image: null,
    videoUrl: null,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 6,
    clientName: "Sanjay & Meera Patel",
    clientRole: "Wedding Couple",
    eventType: "Wedding",
    content: "From the engagement to the reception, DA Creation handled everything with perfection. Their creative ideas for the Sangeet were amazing, and the wedding decor exceeded our expectations.",
    rating: 5,
    image: null,
    videoUrl: null,
    isFeatured: false,
    isActive: true,
  },
];

export default function TestimonialsPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const { data: websiteSettings } = useQuery<WebsiteSettings>({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { weddingsCount: 0, corporateCount: 0, socialCount: 0, awardsCount: 0, ratings: 0 };
      return res.json();
    },
  });

  const stats = [
    { value: "98%", label: "Happy Clients", icon: Heart },
    { value: "4.9/5", label: "Average Rating", icon: Star },
    { value: "500+", label: "Reviews", icon: MessageSquare },
    { value: `${websiteSettings?.awardsCount || 0}+`, label: "Awards Won", icon: Award },
  ];

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/cms/testimonials", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/testimonials?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;
  const featuredTestimonials = displayTestimonials.filter(t => t.isFeatured);
  const regularTestimonials = displayTestimonials.filter(t => !t.isFeatured);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={SEO_DATA.testimonials.title}
        description={SEO_DATA.testimonials.description}
        keywords={SEO_DATA.testimonials.keywords}
        canonicalUrl="https://dacreation.in/testimonials"
        structuredData={getBreadcrumbSchema([
          { name: "Home", url: "https://dacreation.in" },
          { name: "Testimonials", url: "https://dacreation.in/testimonials" }
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
              Client Love
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              Client Testimonials
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Hear what our valued clients have to say about their experiences with DA Creation
            </p>
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

      {/* Featured Testimonials */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Highlights</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Featured Reviews</h2>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#d4af37]/20 relative overflow-hidden"
                  data-testid={`card-testimonial-featured-${testimonial.id}`}
                >
                  <Quote className="absolute top-6 right-6 w-16 h-16 text-[#d4af37]/10" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg">
                      {testimonial.image ? (
                        <img src={testimonial.image} alt={testimonial.clientName} className="w-full h-full object-cover" />
                      ) : (
                        testimonial.clientName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{testimonial.clientName}</h3>
                      {testimonial.clientRole && (
                        <p className="text-sm text-gray-600">{testimonial.clientRole}</p>
                      )}
                      {testimonial.eventType && (
                        <span className="inline-block mt-1 text-xs font-medium text-[#601a29] bg-[#601a29]/10 px-2 py-0.5 rounded-full">
                          {testimonial.eventType}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 text-lg leading-relaxed relative z-10">"{testimonial.content}"</p>
                  
                  {testimonial.videoUrl && (
                    <button
                      onClick={() => setVideoUrl(testimonial.videoUrl)}
                      className="mt-6 inline-flex items-center gap-2 text-[#601a29] hover:text-[#d4af37] font-medium transition-colors"
                      data-testid={`button-video-${testimonial.id}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#601a29]/10 flex items-center justify-center">
                        <Play className="w-4 h-4" />
                      </div>
                      Watch Video Testimonial
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Testimonials Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">What Clients Say</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">More Reviews</h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : regularTestimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-[#601a29]/20 transition-all group"
                  data-testid={`card-testimonial-${testimonial.id}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white font-bold overflow-hidden group-hover:scale-105 transition-transform">
                      {testimonial.image ? (
                        <img src={testimonial.image} alt={testimonial.clientName} className="w-full h-full object-cover" />
                      ) : (
                        testimonial.clientName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.clientName}</h3>
                      {testimonial.eventType && (
                        <span className="text-xs text-[#601a29] font-medium">{testimonial.eventType}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-4">"{testimonial.content}"</p>
                  
                  {testimonial.videoUrl && (
                    <button
                      onClick={() => setVideoUrl(testimonial.videoUrl)}
                      className="mt-4 text-sm text-[#601a29] hover:text-[#d4af37] font-medium transition-colors inline-flex items-center gap-2"
                      data-testid={`button-video-${testimonial.id}`}
                    >
                      <Play className="w-4 h-4" />
                      Watch Video
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Reviews coming soon!</p>
              <p className="text-gray-400">Check back for client testimonials.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 text-[#d4af37] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Happy Clients</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Experience the DA Creation difference and become part of our success stories.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-cta-inquire">
                Start Your Journey With Us
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!videoUrl} onOpenChange={() => setVideoUrl(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {videoUrl && (
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
