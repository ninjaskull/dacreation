import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src="/images/logo-white.png" alt="DA Creation" className="h-24 md:h-32 w-auto object-contain" />
            </div>
            <p className="text-primary-foreground/80 max-w-md text-lg font-light leading-relaxed">
              Curating timeless, elegant, and culturally inspired weddings. 
              We bring your vision to life with refined detailing and modern luxury.
            </p>
            <div className="flex space-x-6 mt-8">
              <a href="#" className="hover:text-secondary transition-colors"><Instagram size={24} /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Facebook size={24} /></a>
              <a href="#" className="hover:text-secondary transition-colors"><Twitter size={24} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-secondary">Explore</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-xl font-medium mb-6 text-secondary">Contact</h3>
            <ul className="space-y-4 font-light">
              <li>hello@dacreation.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Wedding Lane,<br/>Beverly Hills, CA 90210</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/60">
          <p>&copy; 2025 DA Creation. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
