import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Heart,
  Building2,
  PartyPopper,
  Plane,
  Clock,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const servicesData = [
  {
    name: "Weddings",
    href: "/services/weddings",
    icon: Heart,
    description: "Luxury Indian & fusion wedding experiences",
    features: ["Traditional Ceremonies", "Modern Celebrations", "Destination Weddings"]
  },
  {
    name: "Corporate",
    href: "/services/corporate",
    icon: Building2,
    description: "Professional events & conferences",
    features: ["Conferences", "Product Launches", "Team Building"]
  },
  {
    name: "Social",
    href: "/services/social",
    icon: PartyPopper,
    description: "Memorable celebrations & gatherings",
    features: ["Birthday Parties", "Anniversaries", "Private Dinners"]
  },
  {
    name: "Destination",
    href: "/services/destination",
    icon: Plane,
    description: "Exotic locations worldwide",
    features: ["International Venues", "Travel Coordination", "Local Expertise"]
  }
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Our Team", href: "/team" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "Careers", href: "/careers" },
  { name: "Press", href: "/press" }
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [location] = useLocation();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleDropdownEnter = (dropdown: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const isHomePage = location === "/";
  const showTransparent = !isScrolled && isHomePage && !isMobileMenuOpen;

  return (
    <>
      {/* Top Bar - Hidden on mobile, visible on scroll or non-home pages */}
      <div 
        className={cn(
          "fixed top-0 w-full z-[60] transition-all duration-300",
          showTransparent 
            ? "bg-black/20 backdrop-blur-sm border-b border-white/10" 
            : "bg-primary border-b border-primary-foreground/10"
        )}
      >
        <div className="container mx-auto px-6">
          <div className="hidden lg:flex justify-between items-center h-10 text-xs">
            <div className="flex items-center gap-6">
              <a 
                href="tel:+919876543210" 
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  showTransparent 
                    ? "text-white/80 hover:text-white" 
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                )}
                data-testid="link-phone"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 98765 43210</span>
              </a>
              <a 
                href="mailto:hello@dacreation.com" 
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  showTransparent 
                    ? "text-white/80 hover:text-white" 
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                )}
                data-testid="link-email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>hello@dacreation.com</span>
              </a>
              <span 
                className={cn(
                  "flex items-center gap-2",
                  showTransparent 
                    ? "text-white/60" 
                    : "text-primary-foreground/60"
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Mumbai, India</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span 
                className={cn(
                  "flex items-center gap-2",
                  showTransparent 
                    ? "text-white/80" 
                    : "text-primary-foreground/80"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mon - Sat: 10AM - 7PM</span>
              </span>
              <div className={cn(
                "h-4 w-px",
                showTransparent ? "bg-white/20" : "bg-primary-foreground/20"
              )} />
              <div className="flex items-center gap-1">
                <Star className={cn(
                  "w-3.5 h-3.5 fill-current",
                  showTransparent ? "text-amber-300" : "text-amber-400"
                )} />
                <span className={cn(
                  showTransparent 
                    ? "text-white/80" 
                    : "text-primary-foreground/80"
                )}>
                  500+ Events Delivered
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        ref={navRef}
        className={cn(
          "fixed w-full z-50 transition-all duration-300",
          showTransparent 
            ? "top-0 lg:top-10 bg-transparent" 
            : "top-0 lg:top-10 bg-white/95 backdrop-blur-md shadow-lg border-b border-border/40"
        )}
        data-testid="navbar-main"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="relative z-10 flex-shrink-0"
              data-testid="link-logo"
            >
              <img 
                src={showTransparent ? "/images/logo-white.webp" : "/images/logo-maroon.webp"} 
                alt="DA Creation" 
                className="h-10 lg:h-14 w-auto object-contain transition-all duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1">
                {/* Services Mega Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('services')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all rounded-lg",
                      showTransparent 
                        ? "text-white/90 hover:text-white hover:bg-white/10" 
                        : "text-foreground hover:text-primary hover:bg-primary/5",
                      activeDropdown === 'services' && (showTransparent ? "bg-white/10 text-white" : "bg-primary/5 text-primary")
                    )}
                    data-testid="button-services-dropdown"
                  >
                    Services
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      activeDropdown === 'services' && "rotate-180"
                    )} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'services' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                        onMouseEnter={() => handleDropdownEnter('services')}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden min-w-[600px]">
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="w-5 h-5 text-primary" />
                              <h3 className="text-lg font-serif font-semibold text-foreground">Our Services</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {servicesData.map((service) => (
                                <Link
                                  key={service.name}
                                  href={service.href}
                                  className="group p-4 rounded-xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20"
                                  data-testid={`link-service-${service.name.toLowerCase()}`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                      <service.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {service.name}
                                      </h4>
                                      <p className="text-sm text-muted-foreground mt-0.5 mb-2">
                                        {service.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {service.features.map((feature) => (
                                          <span 
                                            key={feature}
                                            className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground"
                                          >
                                            {feature}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Not sure which service fits? We'll help you decide.
                            </p>
                            <Link href="/inquire">
                              <Button size="sm" className="rounded-full gap-2" data-testid="button-mega-menu-cta">
                                Free Consultation
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Company Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('company')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all rounded-lg",
                      showTransparent 
                        ? "text-white/90 hover:text-white hover:bg-white/10" 
                        : "text-foreground hover:text-primary hover:bg-primary/5",
                      activeDropdown === 'company' && (showTransparent ? "bg-white/10 text-white" : "bg-primary/5 text-primary")
                    )}
                    data-testid="button-company-dropdown"
                  >
                    Company
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      activeDropdown === 'company' && "rotate-180"
                    )} />
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === 'company' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                        onMouseEnter={() => handleDropdownEnter('company')}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="bg-white rounded-xl shadow-2xl border border-border/50 overflow-hidden min-w-[220px]">
                          <div className="py-2">
                            {companyLinks.map((link) => (
                              <Link
                                key={link.name}
                                href={link.href}
                                className="block px-5 py-2.5 text-sm text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                data-testid={`link-company-${link.name.toLowerCase().replace(' ', '-')}`}
                              >
                                {link.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Portfolio Link */}
                <Link
                  href="/portfolio"
                  className={cn(
                    "px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all rounded-lg",
                    showTransparent 
                      ? "text-white/90 hover:text-white hover:bg-white/10" 
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  data-testid="link-portfolio-nav"
                >
                  Portfolio
                </Link>

                {/* Contact Link */}
                <Link
                  href="/contact"
                  className={cn(
                    "px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all rounded-lg",
                    showTransparent 
                      ? "text-white/90 hover:text-white hover:bg-white/10" 
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  data-testid="link-contact-nav"
                >
                  Contact
                </Link>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 ml-6 pl-6 border-l border-current/10">
                <Link href="/inquire">
                  <Button 
                    variant={showTransparent ? "outline" : "default"}
                    size="sm"
                    className={cn(
                      "rounded-full px-5 gap-2 font-medium transition-all",
                      showTransparent && "border-white/40 text-white hover:bg-white hover:text-primary"
                    )}
                    data-testid="button-get-quote"
                  >
                    <Calendar className="w-4 h-4" />
                    Get a Quote
                  </Button>
                </Link>
                <a href="tel:+919876543210">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-full px-4 gap-2 font-medium",
                      showTransparent 
                        ? "text-white hover:bg-white/10" 
                        : "text-primary hover:bg-primary/5"
                    )}
                    data-testid="button-call-now"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={cn(
                "lg:hidden relative z-50 p-2 rounded-lg transition-colors",
                isMobileMenuOpen 
                  ? "text-foreground" 
                  : showTransparent 
                    ? "text-white hover:bg-white/10" 
                    : "text-foreground hover:bg-primary/5"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-40 lg:hidden overflow-y-auto"
            data-testid="mobile-menu-overlay"
          >
            <div className="min-h-screen pt-20 pb-8 px-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                {/* Services Accordion */}
                <div>
                  <button
                    onClick={() => setMobileSubmenu(mobileSubmenu === 'services' ? null : 'services')}
                    className="w-full flex items-center justify-between py-4 border-b border-border/50"
                    data-testid="button-mobile-services"
                  >
                    <span className="text-xl font-serif font-medium text-foreground">Services</span>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      mobileSubmenu === 'services' && "rotate-180"
                    )} />
                  </button>
                  <AnimatePresence>
                    {mobileSubmenu === 'services' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="py-3 pl-4 space-y-1">
                          {servicesData.map((service) => (
                            <Link
                              key={service.name}
                              href={service.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 py-3 text-muted-foreground hover:text-primary transition-colors"
                              data-testid={`link-mobile-service-${service.name.toLowerCase()}`}
                            >
                              <service.icon className="w-5 h-5" />
                              <div>
                                <span className="font-medium text-foreground">{service.name}</span>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Company Accordion */}
                <div>
                  <button
                    onClick={() => setMobileSubmenu(mobileSubmenu === 'company' ? null : 'company')}
                    className="w-full flex items-center justify-between py-4 border-b border-border/50"
                    data-testid="button-mobile-company"
                  >
                    <span className="text-xl font-serif font-medium text-foreground">Company</span>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      mobileSubmenu === 'company' && "rotate-180"
                    )} />
                  </button>
                  <AnimatePresence>
                    {mobileSubmenu === 'company' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="py-3 pl-4 space-y-1">
                          {companyLinks.map((link) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-3 text-muted-foreground hover:text-primary transition-colors"
                              data-testid={`link-mobile-company-${link.name.toLowerCase().replace(' ', '-')}`}
                            >
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Portfolio */}
                <Link
                  href="/portfolio"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-4 border-b border-border/50"
                  data-testid="link-mobile-portfolio"
                >
                  <span className="text-xl font-serif font-medium text-foreground">Portfolio</span>
                </Link>

                {/* Contact */}
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-4 border-b border-border/50"
                  data-testid="link-mobile-contact"
                >
                  <span className="text-xl font-serif font-medium text-foreground">Contact</span>
                </Link>
              </div>

              {/* Mobile CTA Section */}
              <div className="mt-8 space-y-4">
                <Link href="/inquire" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full py-6 text-lg gap-2" data-testid="button-mobile-get-quote">
                    <Calendar className="w-5 h-5" />
                    Get a Free Quote
                  </Button>
                </Link>
                <a href="tel:+919876543210" className="block">
                  <Button variant="outline" className="w-full rounded-full py-6 text-lg gap-2" data-testid="button-mobile-call">
                    <Phone className="w-5 h-5" />
                    Call +91 98765 43210
                  </Button>
                </a>
              </div>

              {/* Mobile Contact Info */}
              <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                  <a href="mailto:hello@dacreation.com" className="hover:text-primary transition-colors">
                    hello@dacreation.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>Mumbai, India</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>Mon - Sat: 10AM - 7PM</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 p-4 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-2 text-primary">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">500+ Events Successfully Delivered</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Trusted by families and businesses across India
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
