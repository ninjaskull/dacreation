import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import type { PortfolioItem, PortfolioVideo } from "@shared/schema";

export function Portfolio() {
  const [playingVideo, setPlayingVideo] = useState<PortfolioVideo | null>(null);

  const { data: featuredItems = [], isLoading, error } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
    queryFn: async () => {
      console.log("Fetching portfolio items...");
      const res = await fetch("/api/portfolio");
      if (!res.ok) {
        console.error("Failed to fetch portfolio:", res.statusText);
        return [];
      }
      const items: PortfolioItem[] = await res.json();
      console.log("Fetched items:", items);
      const filtered = items.filter(item => item.isFeatured && item.isActive);
      console.log("Filtered featured items:", filtered);
      return filtered;
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

  if (isLoading) {
    return (
      <section id="portfolio" className="py-24 bg-background">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </section>
    );
  }

  if (featuredItems.length === 0) {
    console.log("No featured items to display");
    return null;
  }

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Our Portfolio</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6">Featured Moments</h2>
            <p className="text-muted-foreground text-lg font-light">
              Every event tells a story. Browse through our curated collection of events crafted with intention, precision, and emotion.
            </p>
          </div>
          <Link href="/portfolio">
            <Button variant="link" className="hidden md:inline-flex text-primary hover:text-secondary text-lg group mt-6 md:mt-0" data-testid="button-view-portfolio-desktop">
              View Full Portfolio <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map((item, index) => {
            const video = featuredVideos.find(v => v.portfolioItemId === item.id);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => video && setPlayingVideo(video)}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-20 duration-500"></div>
                  
                  {video ? (
                    <div className="relative w-full h-full">
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={video.filePath}
                      />
                      <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-7 h-7 fill-primary text-primary ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={item.featuredImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"} 
                      alt={item.title} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}

                  <div className="absolute bottom-0 left-0 w-full p-8 z-30 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-xs uppercase tracking-widest mb-2 text-secondary">{item.category}</p>
                    <h3 className="font-serif text-2xl mb-1">{item.title}</h3>
                    <p className="font-light text-sm opacity-80">{item.location}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/portfolio">
            <Button variant="outline" className="w-full border-primary text-primary" data-testid="button-view-portfolio-mobile">
              View Full Portfolio
            </Button>
          </Link>
        </div>
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-none bg-transparent">
          <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
            {playingVideo && (
              <div className="aspect-video relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                  onClick={() => setPlayingVideo(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
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
    </section>
  );
}
