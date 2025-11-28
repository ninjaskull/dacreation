import { Link } from "wouter";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin,
  Youtube,
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ArrowRight,
  Heart,
  Award,
  Shield,
  Star,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const services = [
    { name: "Wedding Planning", href: "/services/weddings" },
    { name: "Corporate Events", href: "/services/corporate" },
    { name: "Social Celebrations", href: "/services/social" },
    { name: "Destination Events", href: "/services/destination" },
  ];

  const company = [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/team" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Careers", href: "/careers" },
    { name: "Press & Media", href: "/press" },
  ];

  const quickLinks = [
    { name: "Get a Quote", href: "/inquire" },
    { name: "FAQs", href: "/#faq" },
    { name: "Contact Us", href: "/#contact" },
    { name: "Client Portal", href: "/admin/login" },
  ];

  const legal = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const trustBadges = [
    { icon: Award, text: "500+ Events" },
    { icon: Star, text: "4.9/5 Rating" },
    { icon: Shield, text: "Insured & Certified" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-4 space-y-8">
              <div>
                <Link href="/">
                  <img 
                    src="/images/logo-white.webp" 
                    alt="DA Creation" 
                    className="h-14 md:h-16 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    data-testid="footer-logo"
                  />
                </Link>
                <p className="text-primary-foreground/70 mt-6 text-base leading-relaxed max-w-sm">
                  Crafting extraordinary events with modern elegance and cultural soul. 
                  From lavish weddings to corporate galas, we bring your vision to life.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm uppercase tracking-wider text-secondary">
                  Stay Updated
                </h4>
                <p className="text-primary-foreground/60 text-sm">
                  Subscribe for exclusive event tips and inspiration.
                </p>
                <div className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-secondary"
                    data-testid="footer-newsletter-input"
                  />
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="shrink-0"
                    data-testid="footer-newsletter-submit"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300"
                    aria-label={social.label}
                    data-testid={`footer-social-${social.label.toLowerCase()}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-serif text-lg font-medium mb-6 text-secondary">
                    Services
                  </h3>
                  <ul className="space-y-3">
                    {services.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-primary-foreground/70 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                          data-testid={`footer-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <span>{item.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-medium mb-6 text-secondary">
                    Company
                  </h3>
                  <ul className="space-y-3">
                    {company.map((item) => (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          className="text-primary-foreground/70 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                          data-testid={`footer-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <span>{item.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-medium mb-6 text-secondary">
                    Quick Links
                  </h3>
                  <ul className="space-y-3">
                    {quickLinks.map((item) => (
                      <li key={item.name}>
                        {item.href.startsWith('/#') ? (
                          <a 
                            href={item.href}
                            className="text-primary-foreground/70 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                            data-testid={`footer-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span>{item.name}</span>
                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </a>
                        ) : (
                          <Link 
                            href={item.href}
                            className="text-primary-foreground/70 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                            data-testid={`footer-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span>{item.name}</span>
                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <Link href="/inquire">
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2 rounded-full"
                        data-testid="footer-cta-button"
                      >
                        <Sparkles className="h-4 w-4" />
                        Plan Your Event
                      </Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-medium mb-6 text-secondary">
                    Contact
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-primary-foreground/70 text-sm">
                        123 Event Avenue,<br />
                        Mumbai, MH 400001
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-secondary shrink-0" />
                      <a 
                        href="tel:+919876543210" 
                        className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                        data-testid="footer-phone"
                      >
                        +91 98765 43210
                      </a>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-secondary shrink-0" />
                      <a 
                        href="mailto:hello@dacreation.com" 
                        className="text-primary-foreground/70 hover:text-white transition-colors text-sm"
                        data-testid="footer-email"
                      >
                        hello@dacreation.com
                      </a>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-secondary shrink-0" />
                      <span className="text-primary-foreground/70 text-sm">
                        Mon - Sat: 10AM - 7PM
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="py-8">
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {trustBadges.map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-primary-foreground/60"
              >
                <badge.icon className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-primary-foreground/50">
              <span>&copy; {currentYear} DA Creation. All rights reserved.</span>
              <span className="hidden md:inline mx-2">|</span>
              <span className="hidden md:flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> in India
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {legal.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm text-primary-foreground/50 hover:text-white transition-colors"
                  data-testid={`footer-legal-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
