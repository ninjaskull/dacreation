import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/destination_event_beach.png";

export default function DestinationPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <Navbar />
      <main className="pt-20 lg:pt-28">
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Destination Events" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 text-center text-white px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-5xl md:text-7xl mb-6">Destination Events</h1>
              <p className="text-xl font-light max-w-2xl mx-auto">Pan-India and international event planning with complete logistics and hospitality management.</p>
            </motion.div>
          </div>
        </section>

        {/* Details */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative h-[500px]">
                <img src="https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=1935&auto=format&fit=crop" alt="Destination" className="w-full h-full object-cover shadow-xl" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 -z-10" />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="font-serif text-4xl text-primary mb-8">Celebrations Without Borders</h2>
                <p className="text-muted-foreground text-lg mb-6 font-light">
                  Dreaming of a beach wedding in Goa or a palace wedding in Udaipur? DA Creation specializes in logistical mastery for destination events, ensuring a seamless experience for you and your traveling guests.
                </p>
                <ul className="space-y-4">
                  {[
                    "Pan-India Locations (Goa, Jaipur, Udaipur, Kerala)",
                    "International Planning (Dubai, Bali, Thailand)",
                    "Travel & Accommodation Management",
                    "Hospitality Desks & Guest Logistics",
                    "Local Vendor Sourcing",
                    "Welcome Hampers & Guest Experiences"
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
