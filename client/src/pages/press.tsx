import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { PressArticle } from "@shared/schema";
import { Calendar, ExternalLink, ArrowRight } from "lucide-react";

export default function PressPage() {
  const { data: articles = [], isLoading } = useQuery<PressArticle[]>({
    queryKey: ["/api/cms/press", { active: true }],
    queryFn: async () => {
      const res = await fetch("/api/cms/press?active=true");
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const featuredArticles = articles.filter(a => a.isFeatured);
  const regularArticles = articles.filter(a => !a.isFeatured);

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
              Press & Media
            </h1>
            <p className="text-xl text-white/80">
              DA Creation in the news - press coverage and media features
            </p>
          </motion.div>
        </div>
      </section>

      {featuredArticles.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-gray-900 text-center mb-12"
            >
              Featured Coverage
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#d4af37]/20 hover:shadow-xl transition-shadow group"
                  data-testid={`card-press-featured-${article.id}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-[#601a29]/10 to-[#d4af37]/10 relative overflow-hidden">
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src="/Da creation/DA CREATION  LOGO.webp" 
                          alt="DA Creation"
                          className="w-24 h-24 object-contain opacity-30"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="font-medium text-[#601a29]">{article.publication}</span>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#601a29] transition-colors">
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
                        Read Article
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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-5">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : regularArticles && regularArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {regularArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group"
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
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src="/Da creation/DA CREATION  LOGO.webp" 
                          alt="DA Creation"
                          className="w-16 h-16 object-contain opacity-20"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="font-medium text-[#601a29]">{article.publication}</span>
                      {article.publishedDate && (
                        <>
                          <span>•</span>
                          <span>{article.publishedDate}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-[#601a29] transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2 mt-2">{article.excerpt}</p>
                    )}
                    {article.externalUrl && (
                      <a
                        href={article.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#601a29] hover:text-[#d4af37] font-medium transition-colors mt-3"
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
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No press articles yet.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Inquiries</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              For press inquiries, interviews, or media partnerships, please contact our PR team.
            </p>
            <a
              href="mailto:press@dacreation.in"
              className="inline-flex items-center gap-2 bg-[#601a29] hover:bg-[#4a1320] text-white px-6 py-3 rounded-full font-semibold transition-colors"
              data-testid="link-email-press"
            >
              Contact Press Team
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
