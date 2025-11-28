import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { PortfolioItem } from "@shared/schema";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Camera,
  ArrowRight,
  Star,
  Heart,
  Eye,
  Sparkles,
  Award,
  Building2
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const categories = [
  { value: "all", label: "All Events" },
  { value: "wedding", label: "Weddings" },
  { value: "corporate", label: "Corporate" },
  { value: "social", label: "Social Events" },
  { value: "destination", label: "Destination" },
];

const stats = [
  { value: "1000+", label: "Events Executed", icon: Calendar },
  { value: "50+", label: "Destinations", icon: MapPin },
  { value: "10K+", label: "Happy Guests", icon: Users },
  { value: "98%", label: "Client Satisfaction", icon: Star },
];

const defaultPortfolioItems = [
  {
    id: 1,
    title: "Royal Udaipur Wedding",
    category: "wedding",
    description: "A grand palace wedding with traditional Rajasthani elements and modern luxury. This three-day celebration included a Mehndi ceremony, Sangeet night, and a breathtaking lakeside wedding.",
    location: "Udaipur, Rajasthan",
    date: "December 2024",
    client: "The Sharma Family",
    featuredImage: null,
    images: [],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 2,
    title: "Tech Summit 2024",
    category: "corporate",
    description: "Annual technology conference for 2000+ attendees with immersive experiences, keynote sessions, and interactive workshops. Featured industry leaders from across the globe.",
    location: "Mumbai, Maharashtra",
    date: "November 2024",
    client: "TechCorp India",
    featuredImage: null,
    images: [],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 3,
    title: "Golden Anniversary Gala",
    category: "social",
    description: "Elegant 50th anniversary celebration with vintage charm and modern touches. A beautiful tribute to five decades of love and togetherness.",
    location: "Delhi NCR",
    date: "October 2024",
    client: "The Kapoor Family",
    featuredImage: null,
    images: [],
    isFeatured: false,
    isActive: true,
  },
  {
    id: 4,
    title: "Beach Wedding Bliss",
    category: "destination",
    description: "Romantic beachside wedding in Thailand with a sunset ceremony, followed by a reception under the stars. A dream destination wedding come true.",
    location: "Phuket, Thailand",
    date: "September 2024",
    client: "Priya & Rahul",
    featuredImage: null,
    images: [],
    isFeatured: true,
    isActive: true,
  },
  {
    id: 5,
    title: "Corporate Awards Night",
    category: "corporate",
    description: "Glamorous annual awards ceremony celebrating excellence and achievements. An evening of recognition, entertainment, and celebration.",
    location: "Bangalore, Karnataka",
    date: "August 2024",
    client: "Global Solutions Inc.",
    featuredImage: null,
    images: [],
    isFeatured: false,
    isActive: true,
  },
  {
    id: 6,
    title: "Traditional Temple Wedding",
    category: "wedding",
    description: "Sacred temple ceremony blending ancient traditions with elegant celebrations. A beautiful South Indian wedding with authentic rituals.",
    location: "Chennai, Tamil Nadu",
    date: "July 2024",
    client: "The Raghavan Family",
    featuredImage: null,
    images: [],
    isFeatured: false,
    isActive: true,
  },
];

type PortfolioDisplayItem = {
  id: number | string;
  title: string;
  category: string;
  description?: string | null;
  location?: string | null;
  date?: string | null;
  client?: string | null;
  featuredImage?: string | null;
  images?: string[] | null;
  isFeatured?: boolean;
  isActive?: boolean;
};

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioDisplayItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | string | null>(null);
  
  const { data: portfolioItems = [], isLoading } = useQuery<PortfolioDisplayItem[]>({
    queryKey: ["/api/cms/portfolio", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/portfolio?active=true");
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      return data.map((item: PortfolioItem): PortfolioDisplayItem => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        location: item.location,
        date: item.date,
        client: item.client,
        featuredImage: item.featuredImage,
        images: item.images,
        isFeatured: item.isFeatured,
        isActive: item.isActive,
      }));
    },
  });

  const displayItems: PortfolioDisplayItem[] = portfolioItems.length > 0 ? portfolioItems : defaultPortfolioItems;
  
  const filteredItems = displayItems.filter(
    item => activeCategory === "all" || item.category === activeCategory
  );

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
              Our Work
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              Our Portfolio
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Explore our collection of extraordinary events that showcase our creativity, attention to detail, and passion for perfection
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

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 sticky top-0 z-30 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.value
                    ? "bg-[#601a29] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
                data-testid={`button-filter-${category.value}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Featured Work</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              {activeCategory === "all" ? "All Projects" : categories.find(c => c.value === activeCategory)?.label}
            </h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  data-testid={`card-portfolio-${item.id}`}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#601a29]/10 to-[#d4af37]/10 relative overflow-hidden">
                    {item.featuredImage ? (
                      <img 
                        src={item.featuredImage} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#601a29] to-[#d4af37]">
                        <Camera className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                      hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <Button variant="secondary" className="rounded-full gap-2" data-testid={`button-view-${item.id}`}>
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                    
                    {item.isFeatured && (
                      <span className="absolute top-4 right-4 bg-[#d4af37] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Featured
                      </span>
                    )}
                    
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#601a29] text-xs font-semibold px-3 py-1 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#601a29] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#601a29]" />
                          {item.location}
                        </span>
                      )}
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-[#601a29]" />
                          {item.date}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {activeCategory === "all" 
                  ? "No portfolio items found." 
                  : `No ${activeCategory} events found.`}
              </p>
              <p className="text-gray-400">Check back soon for new additions.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Highlights */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Highlights</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">What We Do Best</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our expertise spans across various event categories, each executed with precision and creativity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: "Weddings", count: "500+", desc: "Dream weddings crafted with love" },
              { icon: Building2, title: "Corporate", count: "300+", desc: "Professional events that impress" },
              { icon: Star, title: "Social", count: "200+", desc: "Celebrations that bring joy" },
              { icon: Award, title: "Awards", count: "25+", desc: "Industry recognition earned" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-[#601a29]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#601a29] transition-colors">
                  <item.icon className="w-7 h-7 text-[#601a29] group-hover:text-white transition-colors" />
                </div>
                <p className="text-3xl font-bold text-[#601a29] mb-1">{item.count}</p>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your Own Story?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss how we can bring your vision to life and add your event to our portfolio of success stories.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white" data-testid="button-start-planning">
                Start Planning Your Event
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedItem.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedItem.featuredImage ? (
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img 
                      src={selectedItem.featuredImage} 
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center">
                    <Camera className="w-20 h-20 text-white/30" />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-[#601a29]/10 text-[#601a29] rounded-full font-medium capitalize">
                    {selectedItem.category}
                  </span>
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
                  <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                )}
                
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Gallery</h4>
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
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link href="/inquire">
                    <Button className="w-full rounded-full gap-2" data-testid="button-plan-similar">
                      Plan a Similar Event
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
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
