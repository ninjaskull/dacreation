import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { PressArticle } from "@shared/schema";
import { 
  Calendar, 
  ExternalLink, 
  ArrowRight,
  Newspaper,
  Tv,
  Award,
  BookOpen,
  Sparkles,
  Download,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

interface WebsiteSettings {
  weddingsCount: number;
  corporateCount: number;
  socialCount: number;
  awardsCount: number;
}

const mediaLogos = [
  "Times of India",
  "Economic Times",
  "NDTV",
  "India Today",
  "Vogue India",
  "Harper's Bazaar",
  "Wedding Sutra",
  "WeddingWire"
];

const defaultArticles = [
  {
    id: 1,
    title: "DA Creation Named Best Event Management Company 2024",
    publication: "Wedding Industry Awards",
    publishedDate: "November 2024",
    excerpt: "DA Creation has been recognized as the Best Event Management Company at the prestigious Wedding Industry Awards 2024, celebrating excellence in creating memorable celebrations.",
    image: null,
    externalUrl: "#",
    isFeatured: true,
    isActive: true,
  },
  {
    id: 2,
    title: "The Rise of Destination Weddings: An Interview with DA Creation's Founder",
    publication: "Vogue India",
    publishedDate: "October 2024",
    excerpt: "An exclusive interview discussing the growing trend of destination weddings and how DA Creation is leading the charge in creating unforgettable experiences.",
    image: null,
    externalUrl: "#",
    isFeatured: true,
    isActive: true,
  },
  {
    id: 3,
    title: "Top 10 Event Planners Transforming Indian Weddings",
    publication: "Harper's Bazaar",
    publishedDate: "September 2024",
    excerpt: "DA Creation featured among the top event planners who are revolutionizing the Indian wedding industry with innovative concepts and flawless execution.",
    image: null,
    externalUrl: "#",
    isFeatured: false,
    isActive: true,
  },
  {
    id: 4,
    title: "Corporate Events: How DA Creation Delivers Excellence",
    publication: "Economic Times",
    publishedDate: "August 2024",
    excerpt: "A feature on how DA Creation has become the preferred partner for Fortune 500 companies for their corporate events and conferences.",
    image: null,
    externalUrl: "#",
    isFeatured: false,
    isActive: true,
  },
  {
    id: 5,
    title: "Sustainability in Event Planning: DA Creation's Green Initiative",
    publication: "India Today",
    publishedDate: "July 2024",
    excerpt: "Exploring DA Creation's commitment to sustainable event practices and eco-friendly alternatives without compromising on luxury.",
    image: null,
    externalUrl: "#",
    isFeatured: false,
    isActive: true,
  },
  {
    id: 6,
    title: "Behind the Scenes: Planning a Royal Palace Wedding",
    publication: "Wedding Sutra",
    publishedDate: "June 2024",
    excerpt: "An exclusive behind-the-scenes look at how DA Creation orchestrated a magnificent three-day celebration at a Rajasthani palace.",
    image: null,
    externalUrl: "#",
    isFeatured: false,
    isActive: true,
  },
];

export default function PressPage() {
  const { branding } = useBranding();
  const { data: websiteSettings } = useQuery<WebsiteSettings>({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { weddingsCount: 0, corporateCount: 0, socialCount: 0, awardsCount: 0 };
      return res.json();
    },
  });

  const stats = [
    { value: "100+", label: "Media Features", icon: Newspaper },
    { value: "25+", label: "TV Appearances", icon: Tv },
    { value: `${websiteSettings?.awardsCount || 0}+`, label: "Awards", icon: Award },
    { value: "15+", label: "Publications", icon: BookOpen },
  ];

  const { data: articles = [], isLoading } = useQuery<PressArticle[]>({
    queryKey: ["/api/cms/press", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/press?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const displayArticles = articles.length > 0 ? articles : defaultArticles;
  const featuredArticles = displayArticles.filter(a => a.isFeatured);
  const regularArticles = displayArticles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="press"
        canonicalUrl={`${branding.domain.url}/press`}
        structuredData={getBreadcrumbSchema(branding, [
          { name: "Home", url: branding.domain.url },
          { name: "Press & Media", url: `${branding.domain.url}/press` }
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
              In the News
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              Press & Media
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              DA Creation in the news - explore our media features, press coverage, and industry recognition
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

      {/* Media Logos */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">As Featured In</p>
          </motion.div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {mediaLogos.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="text-gray-400 font-semibold text-lg hover:text-[#601a29] transition-colors"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Highlights</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Featured Coverage</h2>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#d4af37]/20 hover:shadow-xl transition-all group"
                  data-testid={`card-press-featured-${article.id}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-[#601a29] to-[#d4af37] relative overflow-hidden">
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#d4af37] text-white text-xs font-semibold rounded-full shadow-lg">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="font-semibold text-[#601a29]">{article.publication}</span>
                      {article.publishedDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {article.publishedDate}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#601a29] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
                    )}
                    {article.externalUrl && (
                      <a
                        href={article.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#601a29] hover:text-[#d4af37] font-medium transition-colors"
                        data-testid={`link-read-${article.id}`}
                      >
                        Read Full Article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">All Coverage</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">More Media Features</h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse shadow-sm">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : regularArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {regularArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#601a29]/20 transition-all group"
                  data-testid={`card-press-${article.id}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#601a29]/5 to-[#d4af37]/5">
                        <Newspaper className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="font-semibold text-[#601a29]">{article.publication}</span>
                      {article.publishedDate && (
                        <>
                          <span>•</span>
                          <span>{article.publishedDate}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#601a29] transition-colors mb-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
                    )}
                    {article.externalUrl && (
                      <a
                        href={article.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#601a29] hover:text-[#d4af37] font-medium transition-colors"
                        data-testid={`link-read-${article.id}`}
                      >
                        Read More
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl max-w-4xl mx-auto">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Press coverage coming soon!</p>
              <p className="text-gray-400">Check back for media features and news.</p>
            </div>
          )}
        </div>
      </section>

      {/* Press Kit & Contact */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
            >
              <Download className="w-10 h-10 text-[#601a29] mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Press Kit</h3>
              <p className="text-gray-600 mb-6">
                Download our official press kit containing company information, high-resolution logos, and brand guidelines.
              </p>
              <Button variant="outline" className="rounded-full gap-2 border-[#601a29] text-[#601a29] hover:bg-[#601a29] hover:text-white">
                <Download className="w-4 h-4" />
                Download Press Kit
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#601a29] to-[#7a2233] rounded-2xl p-8 text-white"
            >
              <Mail className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-2xl font-bold mb-3">Media Inquiries</h3>
              <p className="text-white/80 mb-6">
                For press inquiries, interviews, or media partnerships, please contact our PR team. We'd love to hear from you.
              </p>
              <a href="mailto:press@dacreation.in" data-testid="link-email-press">
                <Button className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white">
                  Contact Press Team
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Be Part of Our Story?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join the many clients who have trusted DA Creation with their most important celebrations.
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

      <Footer />
    </div>
  );
}
