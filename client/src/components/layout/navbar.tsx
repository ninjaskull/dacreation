import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Don't show navbar transparency on pages other than home if needed, 
  // but for consistency we'll keep the scroll logic. 
  // However, if we are on specific pages (like inquire), we might want a solid background always if it overlaps content.
  // For now, the design works well with the overlay.

  const navLinks = [
    { name: "Services", href: "/#services" }, // Updated to absolute paths with hash
    { name: "Portfolio", href: "/#portfolio" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled || location !== "/"
          ? "bg-white/95 backdrop-blur-md py-3 shadow-sm border-border/40" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center relative">
        <Link href="/" className={cn(
          "font-serif text-2xl md:text-3xl font-bold tracking-tighter transition-colors block",
          !isScrolled && location === "/" && !isMobileMenuOpen ? "absolute top-1/2 -translate-y-1/2" : ""
        )}>
          <img 
            src={(isScrolled || location !== "/" || isMobileMenuOpen) ? "/images/logo-maroon.webp" : "/images/logo-white.webp"} 
            alt="DA Creation" 
            className={cn(
              "w-auto object-contain transition-all duration-300",
              !isScrolled && location === "/" && !isMobileMenuOpen 
                ? "h-16 md:h-20 mt-4 md:mt-6" 
                : "h-10 md:h-12 mt-0"
            )}
          />
        </Link>

        {/* Spacer for logo to maintain layout if needed, only when hanging */}
        <div className={cn("transition-all duration-300", !isScrolled && location === "/" && !isMobileMenuOpen ? "w-16 md:w-20" : "hidden md:block w-0")}></div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide uppercase transition-colors hover:text-secondary",
                (isScrolled || location !== "/") ? "text-foreground" : "text-white/90"
              )}
            >
              {link.name}
            </a>
          ))}
          <Link href="/inquire">
            <Button 
              variant={(isScrolled || location !== "/") ? "default" : "secondary"}
              size="sm"
              className={cn(
                "rounded-none px-6 transition-all",
                (!isScrolled && location === "/") && "bg-white/20 hover:bg-white/30 text-white border border-white/40"
              )}
            >
              Get a Quote
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground z-50 relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="text-foreground w-8 h-8" />
          ) : (
            <Menu className={cn("w-8 h-8", (isScrolled || location !== "/") ? "text-foreground" : "text-white")} />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-40 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-200 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-3xl font-serif font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <Link href="/inquire" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="rounded-none bg-primary text-white px-10 py-6 text-xl mt-8">
              Get a Quote
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
