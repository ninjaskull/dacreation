import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md py-4 shadow-sm border-border/40" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/">
          <a className={cn(
            "font-serif text-2xl md:text-3xl font-bold tracking-tighter transition-colors",
            isScrolled ? "text-primary" : "text-white"
          )}>
            AURA
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide uppercase transition-colors hover:text-secondary",
                isScrolled ? "text-foreground" : "text-white/90"
              )}
            >
              {link.name}
            </a>
          ))}
          <Button 
            variant={isScrolled ? "default" : "secondary"}
            size="sm"
            className={cn(
              "rounded-none px-6 transition-all",
              !isScrolled && "bg-white/20 hover:bg-white/30 text-white border border-white/40"
            )}
          >
            Book Consultation
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground z-50 relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="text-foreground w-8 h-8" />
          ) : (
            <Menu className={cn("w-8 h-8", isScrolled ? "text-foreground" : "text-white")} />
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
          <Button className="rounded-none bg-primary text-white px-10 py-6 text-xl mt-8" onClick={() => setIsMobileMenuOpen(false)}>
            Book Consultation
          </Button>
        </div>
      )}
    </nav>
  );
}
