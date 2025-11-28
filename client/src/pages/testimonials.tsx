import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";
import { Star, Quote, Play } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "wouter";

export default function TestimonialsPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/cms/testimonials", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/testimonials?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const featuredTestimonials = testimonials.filter(t => t.isFeatured);
  const regularTestimonials = testimonials.filter(t => !t.isFeatured);

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
              Client Testimonials
            </h1>
            <p className="text-xl text-white/80">
              Hear what our valued clients have to say about their experiences
            </p>
          </motion.div>
        </div>
      </section>

      {featuredTestimonials.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-900 text-center mb-12"
            >
              Featured Reviews
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-[#d4af37]/20 relative"
                  data-testid={`card-testimonial-featured-${testimonial.id}`}
                >
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-[#d4af37]/20" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
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
                  
                  <p className="text-gray-600 text-lg leading-relaxed">"{testimonial.content}"</p>
                  
                  {testimonial.videoUrl && (
                    <button
                      onClick={() => setVideoUrl(testimonial.videoUrl)}
                      className="mt-4 inline-flex items-center gap-2 text-[#601a29] hover:text-[#d4af37] font-medium transition-colors"
                      data-testid={`button-video-${testimonial.id}`}
                    >
                      <Play className="w-4 h-4" />
                      Watch Video Testimonial
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
          ) : regularTestimonials && regularTestimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.1 }}
                  className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                  data-testid={`card-testimonial-${testimonial.id}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white font-bold overflow-hidden">
                      {testimonial.image ? (
                        <img src={testimonial.image} alt={testimonial.clientName} className="w-full h-full object-cover" />
                      ) : (
                        testimonial.clientName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testimonial.clientName}</h3>
                      {testimonial.eventType && (
                        <span className="text-xs text-[#601a29]">{testimonial.eventType}</span>
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
                      className="mt-3 text-sm text-[#601a29] hover:text-[#d4af37] font-medium transition-colors inline-flex items-center gap-1"
                      data-testid={`button-video-${testimonial.id}`}
                    >
                      <Play className="w-3 h-3" />
                      Watch Video
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No testimonials yet.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16 bg-[#601a29] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Join Our Happy Clients</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Experience the DA Creation difference and become part of our success stories.
            </p>
            <Link href="/inquire">
              <button
                className="bg-[#d4af37] hover:bg-[#c5a030] text-white px-8 py-3 rounded-full font-semibold transition-colors"
                data-testid="button-cta-inquire"
              >
                Start Your Journey With Us
              </button>
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
