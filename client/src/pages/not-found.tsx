import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, Search, PartyPopper, Calendar, ArrowRight } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

const funnyLines = [
  "Oops! This page pulled a disappearing act worthy of a magician at a corporate event!",
  "Looks like this page left the party early without saying goodbye.",
  "This page is more lost than a guest without a seating chart.",
  "404: The only event we couldn't plan for!",
  "Even our best event planners couldn't find this page.",
  "This page ghosted us harder than a last-minute wedding cancellation.",
];

const catchyLines = [
  "Don't worry, we've got plenty of celebrations waiting for you!",
  "Let's get you back to the festivities.",
  "The real party is just a click away.",
  "Every great event has a detour – this is yours!",
];

export default function NotFound() {
  const { branding } = useBranding();
  const randomFunny = funnyLines[Math.floor(Math.random() * funnyLines.length)];
  const randomCatchy = catchyLines[Math.floor(Math.random() * catchyLines.length)];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mb-8"
            >
              <div className="text-[180px] md:text-[220px] font-bold bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#d4af37] bg-clip-text text-transparent leading-none">
                404
              </div>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute top-4 right-1/4"
              >
                <PartyPopper className="w-12 h-12 text-[#d4af37]" />
              </motion.div>
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  delay: 1
                }}
                className="absolute top-8 left-1/4"
              >
                <Calendar className="w-10 h-10 text-[#601a29]" />
              </motion.div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              data-testid="text-404-title"
            >
              Page Not Found
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-[#601a29] font-medium mb-4"
              data-testid="text-funny-line"
            >
              {randomFunny}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-8 no-underline"
              style={{ textDecoration: 'none' }}
              data-testid="text-catchy-line"
            >
              {randomCatchy}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/">
                <Button 
                  size="lg" 
                  className="rounded-full gap-2 bg-gradient-to-r from-[#601a29] to-[#7a2233] hover:from-[#7a2233] hover:to-[#601a29]"
                  data-testid="button-go-home"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/inquire">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full gap-2 border-[#601a29] text-[#601a29] hover:bg-[#601a29] hover:text-white"
                  data-testid="button-plan-event"
                >
                  Plan Your Event
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100"
            >
              <p className="text-gray-500 text-sm mb-4">Looking for something specific?</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/services/weddings">
                  <Button variant="ghost" size="sm" className="text-[#601a29] hover:bg-[#601a29]/10" data-testid="link-weddings">
                    Weddings
                  </Button>
                </Link>
                <Link href="/services/corporate">
                  <Button variant="ghost" size="sm" className="text-[#601a29] hover:bg-[#601a29]/10" data-testid="link-corporate">
                    Corporate Events
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="ghost" size="sm" className="text-[#601a29] hover:bg-[#601a29]/10" data-testid="link-portfolio">
                    Portfolio
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" size="sm" className="text-[#601a29] hover:bg-[#601a29]/10" data-testid="link-about">
                    About Us
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" size="sm" className="text-[#601a29] hover:bg-[#601a29]/10" data-testid="link-contact">
                    Contact
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-gray-400 text-sm"
            >
              {branding.company.name} - Because every moment deserves to be celebrated!
            </motion.p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
