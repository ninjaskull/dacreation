import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import { 
  Calendar, 
  User, 
  ArrowRight,
  Eye,
  Tag,
  BookOpen
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { value: "all", label: "All Posts" },
  { value: "weddings", label: "Weddings" },
  { value: "corporate", label: "Corporate Events" },
  { value: "destination", label: "Destination Events" },
  { value: "planning", label: "Event Planning Tips" },
  { value: "trends", label: "Industry Trends" },
];

export default function BlogPage() {
  const { branding } = useBranding();
  
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const featuredPost = posts.find(p => p.isFeatured) || posts[0];
  const regularPosts = posts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Blog - Event Planning Tips & Insights"
        description="Discover expert tips, latest trends, and inspiring stories from the world of event management in India."
        canonicalUrl={`${branding.domain.url}/blog`}
        structuredData={getBreadcrumbSchema(branding, [
          { name: "Home", url: branding.domain.url },
          { name: "Blog", url: `${branding.domain.url}/blog` }
        ])}
      />
      <Navbar />
      
      <section className="relative pt-32 lg:pt-40 pb-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-12 bg-secondary" />
              <span className="text-secondary uppercase tracking-[0.2em] text-sm font-medium">
                Insights & Inspiration
              </span>
              <div className="h-px w-12 bg-secondary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              Our Blog
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Discover expert tips, latest trends, and inspiring stories from the world of event management in India.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-serif text-2xl text-foreground mb-4">No Blog Posts Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on creating insightful content for you. Please check back soon!
              </p>
            </div>
          ) : (
            <>
              {featuredPost && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-16"
                >
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <div className="group relative grid md:grid-cols-2 gap-8 bg-gradient-to-br from-muted to-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500" data-testid={`blog-featured-${featuredPost.id}`}>
                      <div className="relative h-64 md:h-auto min-h-[300px] overflow-hidden">
                        {featuredPost.featuredImage ? (
                          <img 
                            src={featuredPost.featuredImage} 
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <BookOpen className="h-20 w-20 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-secondary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </div>
                      </div>
                      <div className="p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          {featuredPost.category && (
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium capitalize">
                              {featuredPost.category}
                            </span>
                          )}
                          {featuredPost.publishedAt && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(featuredPost.publishedAt), 'MMMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                          {featuredPost.excerpt || featuredPost.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {featuredPost.author && (
                              <span className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {featuredPost.author}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-4 w-4" />
                              {featuredPost.viewCount} views
                            </span>
                          </div>
                          <span className="text-primary font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                            Read More <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {regularPosts.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="group h-full bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300" data-testid={`blog-card-${post.id}`}>
                          <div className="relative h-48 overflow-hidden">
                            {post.featuredImage ? (
                              <img 
                                src={post.featuredImage} 
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-primary/30" />
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                              {post.category && (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium capitalize">
                                  {post.category}
                                </span>
                              )}
                              {post.publishedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                              {post.excerpt || post.content.substring(0, 100)}...
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                {post.author && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    {post.author}
                                  </span>
                                )}
                              </div>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                {post.viewCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
              Ready to Create Your Perfect Event?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Let us bring your vision to life with our expert planning and execution.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary-foreground">
                Start Planning Your Event <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
