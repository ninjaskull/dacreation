import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/corporate_conference_stage.png";
import galaImg from "@assets/generated_images/corporate_event_gala.png";

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <Navbar />
      <main className="pt-20 lg:pt-28">
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Corporate Events" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 text-center text-white px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-5xl md:text-7xl mb-6">Corporate Events</h1>
              <p className="text-xl font-light max-w-2xl mx-auto">Professional, polished, and impact-driven events—from conferences to award shows.</p>
            </motion.div>
          </div>
        </section>

        {/* Details */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative h-[500px]">
                <img src={galaImg} alt="Corporate Gala" className="w-full h-full object-cover shadow-xl" />
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 -z-10" />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="font-serif text-4xl text-primary mb-8">Elevating Corporate Experiences</h2>
                <p className="text-muted-foreground text-lg mb-6 font-light">
                  DA Creation brings strategic thinking and flawless execution to corporate events. We ensure your brand message is delivered effectively through immersive experiences and professional management.
                </p>
                <ul className="space-y-4">
                  {[
                    "Conferences & Seminars",
                    "Product Launches & Brand Activations",
                    "Annual Events & Award Nights",
                    "Corporate Retreats & Offsites",
                    "Team Building Activities",
                    "VIP Guest Management"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground/80">
                      <CheckCircle2 className="text-secondary w-5 h-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
    </div>
  );
}
