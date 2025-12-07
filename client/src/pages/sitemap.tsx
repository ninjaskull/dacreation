import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { 
  Home, 
  Heart, 
  Building2, 
  PartyPopper, 
  Plane, 
  Users, 
  Briefcase, 
  Image, 
  Star, 
  Newspaper, 
  Phone, 
  Calendar,
  MapPin
} from "lucide-react";

const sitemapData = [
  {
    category: "Main Pages",
    icon: Home,
    links: [
      { name: "Home", href: "/", description: "Welcome to DA Creation" },
      { name: "About Us", href: "/about", description: "Learn about our story and mission" },
      { name: "Contact", href: "/contact", description: "Get in touch with us" },
      { name: "Get a Quote", href: "/inquire", description: "Request a free consultation" },
    ]
  },
  {
    category: "Our Services",
    icon: Calendar,
    links: [
      { name: "Wedding Planning", href: "/services/weddings", description: "Luxury wedding experiences" },
      { name: "Corporate Events", href: "/services/corporate", description: "Professional business events" },
      { name: "Social Celebrations", href: "/services/social", description: "Memorable social gatherings" },
      { name: "Destination Events", href: "/services/destination", description: "Events at exotic locations" },
    ]
  },
  {
    category: "Company",
    icon: Building2,
    links: [
      { name: "Our Team", href: "/team", description: "Meet our expert planners" },
      { name: "Portfolio", href: "/portfolio", description: "View our past events" },
      { name: "Testimonials", href: "/testimonials", description: "What our clients say" },
      { name: "Careers", href: "/careers", description: "Join our team" },
      { name: "Press & Media", href: "/press", description: "News and media coverage" },
    ]
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="sitemap-page">
      <SEOHead
        title="Sitemap | DA Creation - Best Event Management Company in Pune"
        description="Navigate through all pages of DA Creation website. Find information about our wedding planning, corporate events, social celebrations, and destination event services."
        canonicalUrl="https://dacreation.in/sitemap"
      />
      <Navbar />
      
      <main className="pt-24 lg:pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              <MapPin className="w-4 h-4 inline mr-2" />
              Site Navigation
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="sitemap-title">
              Sitemap
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find your way around our website. Browse all our pages and services below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sitemapData.map((section) => (
              <div 
                key={section.category} 
                className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 hover:shadow-md transition-shadow"
                data-testid={`sitemap-section-${section.category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    {section.category}
                  </h2>
                </div>
                
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="group flex flex-col p-3 rounded-lg hover:bg-primary/5 transition-colors"
                        data-testid={`sitemap-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {link.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {link.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              Last updated: {new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
