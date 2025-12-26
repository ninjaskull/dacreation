import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { Portfolio } from "@/components/sections/portfolio";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { LeadMagnetsSection } from "@/components/sales/lead-magnets";
import { ConsultationCTA } from "@/components/sales/consultation-cta";
import { TrustedClients } from "@/components/sections/trusted-clients";
import { SEOHead, useOrganizationSchema, useLocalBusinessSchema } from "@/components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { useBranding } from "@/contexts/BrandingContext";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type PortfolioVideo = {
  id: string;
  filePath: string;
  portfolioItemId: string;
  title: string;
};

export default function Home() {
  const { branding } = useBranding();
  const orgSchema = useOrganizationSchema();
  const localBusinessSchema = useLocalBusinessSchema();
  const [playingVideo, setPlayingVideo] = useState<PortfolioVideo | null>(null);
  
  const { data: websiteSettings } = useQuery({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { showPreferredBy: true, showTrustedBy: true };
      return res.json();
    },
  });

  const { data: featuredVideos = [] } = useQuery<PortfolioVideo[]>({
    queryKey: ["/api/settings/featured-videos"],
    queryFn: async () => {
      const res = await fetch("/api/settings/featured-videos");
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <SEOHead
        pageType="home"
        canonicalUrl={`${branding.domain.url}/`}
        structuredData={{...orgSchema, ...localBusinessSchema}}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyChooseUs />
        <Services />
        <ConsultationCTA />
        
        {/* Featured Videos Showcase */}
        {featuredVideos.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320]">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Our Best Work</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Featured Moments</h2>
                <p className="text-white/80 max-w-2xl mx-auto">Watch the highlights from our most memorable events</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredVideos.map((video, idx) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => setPlayingVideo(video)}
                  >
                    <div className="p-1 bg-gradient-to-br from-[#d4af37]/60 via-[#d4af37]/40 to-[#d4af37]/20 rounded-2xl shadow-2xl hover:shadow-3xl group-hover:from-[#d4af37]/80 group-hover:via-[#d4af37]/60 group-hover:to-[#d4af37]/40 transition-all duration-300">
                      <div className="p-4 bg-white rounded-xl">
                        <div className="relative bg-black rounded-lg overflow-hidden border-4 border-[#601a29]/20 shadow-inner">
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain bg-black group-hover:opacity-80 transition-opacity duration-300"
                            src={video.filePath}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                              <div className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Play className="w-7 h-7 fill-[#601a29] text-[#601a29] ml-1" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Portfolio />
        <LeadMagnetsSection />
        <Testimonials />
        <FAQ />
        {websiteSettings?.showPreferredBy !== false && <TrustedClients variant="light" />}
        <Contact />
      </main>
      
      {/* Video Player Modal */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            {playingVideo && (
              <div className="aspect-video">
                <video
                  autoPlay
                  controls
                  className="w-full h-full"
                  src={playingVideo.filePath}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
