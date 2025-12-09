import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import { 
  Calendar, 
  User, 
  ArrowLeft,
  ArrowRight,
  Eye,
  Tag,
  BookOpen,
  Share2,
  Clock
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'style', 'width', 'height'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
}

export default function BlogPostPage() {
  const { branding } = useBranding();
  const { slug } = useParams<{ slug: string }>();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const relatedPosts = allPosts
    .filter(p => p.id !== post?.id && p.category === post?.category)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 lg:pt-40 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-96 w-full mb-8 rounded-xl" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 lg:pt-40 pb-20">
          <div className="container mx-auto px-4 text-center">
            <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt || post.content.substring(0, 160)}
        canonicalUrl={`${branding.domain.url}/blog/${post.slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt || post.content.substring(0, 160),
          "author": {
            "@type": "Person",
            "name": post.author || branding.company.name
          },
          "datePublished": post.publishedAt,
          "dateModified": post.updatedAt,
          "image": post.featuredImage,
          "publisher": {
            "@type": "Organization",
            "name": branding.company.name,
            "logo": {
              "@type": "ImageObject",
              "url": `${branding.domain.url}/images/logo-maroon.png`
            }
          }
        }}
      />
      <Navbar />
      
      <article className="pt-28 lg:pt-36 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/blog">
                <Button variant="ghost" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground" data-testid="back-to-blog">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                </Button>
              </Link>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {post.category && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium capitalize">
                    {post.category}
                  </span>
                )}
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </span>
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight" data-testid="blog-post-title">
                {post.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {post.author && (
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{post.author}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {post.viewCount} views
                  </span>
                </div>
              </div>

              {post.featuredImage && (
                <div className="relative mb-10 rounded-2xl overflow-hidden">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                    data-testid="blog-post-image"
                  />
                </div>
              )}

              <div 
                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-img:rounded-xl prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: isHtmlContent(post.content) ? sanitizeHtml(post.content) : formatContent(post.content) }}
                data-testid="blog-post-content"
              />

              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {post.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {(prevPost || nextPost) && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="grid md:grid-cols-2 gap-6">
                  {prevPost && (
                    <Link href={`/blog/${prevPost.slug}`}>
                      <div className="group p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all" data-testid="prev-post">
                        <span className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <ArrowLeft className="h-3.5 w-3.5" /> Previous
                        </span>
                        <h4 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {prevPost.title}
                        </h4>
                      </div>
                    </Link>
                  )}
                  {nextPost && (
                    <Link href={`/blog/${nextPost.slug}`}>
                      <div className="group p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all text-right md:col-start-2" data-testid="next-post">
                        <span className="text-sm text-muted-foreground flex items-center justify-end gap-1 mb-2">
                          Next <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {nextPost.title}
                        </h4>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16 pt-12 border-t border-border"
            >
              <h2 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-10">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {relatedPosts.map((related) => (
                  <Link key={related.id} href={`/blog/${related.slug}`}>
                    <div className="group h-full bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300" data-testid={`related-post-${related.id}`}>
                      <div className="relative h-40 overflow-hidden">
                        {related.featuredImage ? (
                          <img 
                            src={related.featuredImage} 
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {related.excerpt || related.content.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </article>

      <section className="py-16 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
              Ready to Create Your Dream Event?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Get in touch with our expert team to start planning your perfect celebration.
            </p>
            <Link href="/inquire">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-primary-foreground">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function formatContent(content: string): string {
  let formatted = content;
  
  // Process headings first (before paragraph wrapping)
  // Match headings at the start of lines
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Process lists
  formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive li elements in ul
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  
  // Process inline formatting
  formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Process links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Process blockquotes
  formatted = formatted.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Process inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Process code blocks
  formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  
  // Process horizontal rules
  formatted = formatted.replace(/^---$/gm, '<hr/>');
  formatted = formatted.replace(/^\*\*\*$/gm, '<hr/>');
  
  // Split by double newlines for paragraphs (excluding already processed elements)
  const paragraphs = formatted.split(/\n\n+/);
  formatted = paragraphs.map(p => {
    const trimmed = p.trim();
    // Don't wrap block elements in paragraphs
    if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>') || 
        trimmed.startsWith('<h3>') || trimmed.startsWith('<h4>') ||
        trimmed.startsWith('<ul>') || trimmed.startsWith('<ol>') ||
        trimmed.startsWith('<blockquote>') || trimmed.startsWith('<pre>') ||
        trimmed.startsWith('<hr')) {
      return trimmed;
    }
    // Replace single newlines with <br/> within paragraphs
    const withBreaks = trimmed.replace(/\n/g, '<br/>');
    return withBreaks ? `<p>${withBreaks}</p>` : '';
  }).filter(p => p).join('\n');
  
  // Clean up empty paragraphs
  formatted = formatted.replace(/<p><\/p>/g, '');
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');
  
  return formatted;
}
