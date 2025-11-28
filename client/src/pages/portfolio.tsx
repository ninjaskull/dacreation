import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { PortfolioItem } from "@shared/schema";
import { MapPin, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const categories = [
  { value: "all", label: "All Events" },
  { value: "wedding", label: "Weddings" },
  { value: "corporate", label: "Corporate" },
  { value: "social", label: "Social Events" },
  { value: "destination", label: "Destination" },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  
  const { data: portfolioItems = [], isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/cms/portfolio", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/portfolio?active=true");
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const filteredItems = portfolioItems.filter(
    item => activeCategory === "all" || item.category === activeCategory
  );

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
              Our Portfolio
            </h1>
            <p className="text-xl text-white/80">
              Explore our collection of beautifully crafted events
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-gray-50 sticky top-0 z-20 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category.value
                    ? "bg-[#601a29] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                data-testid={`button-filter-${category.value}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                  data-testid={`card-portfolio-${item.id}`}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#601a29]/10 to-[#d4af37]/10 relative overflow-hidden">
                    {item.featuredImage ? (
                      <img 
                        src={item.featuredImage} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src="/Da creation/DA CREATION  LOGO.webp" 
                          alt="DA Creation"
                          className="w-32 h-32 object-contain opacity-30"
                        />
                      </div>
                    )}
                    {item.isFeatured && (
                      <span className="absolute top-4 right-4 bg-[#d4af37] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-[#601a29] uppercase tracking-wide">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </span>
                      )}
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {activeCategory === "all" 
                  ? "No portfolio items found." 
                  : `No ${activeCategory} events found.`}
              </p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedItem.featuredImage && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={selectedItem.featuredImage} 
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {selectedItem.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#601a29]" />
                      {selectedItem.location}
                    </span>
                  )}
                  {selectedItem.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#601a29]" />
                      {selectedItem.date}
                    </span>
                  )}
                  {selectedItem.client && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#601a29]" />
                      {selectedItem.client}
                    </span>
                  )}
                </div>
                
                {selectedItem.description && (
                  <p className="text-gray-600">{selectedItem.description}</p>
                )}
                
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedItem.images.map((image, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${selectedItem.title} - ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
