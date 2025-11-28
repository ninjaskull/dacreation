import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/indian_bride_and_groom_minimalist.png";
import decorImg from "@assets/generated_images/indian_wedding_decor_detail.png";

export default function WeddingsPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <Navbar />
      <main className="pt-20 lg:pt-28">
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Weddings" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 text-center text-white px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-5xl md:text-7xl mb-6">Weddings & Cultural Celebrations</h1>
              <p className="text-xl font-light max-w-2xl mx-auto">Modern design meets rich Indian tradition. We plan every ritual, ceremony, and moment effortlessly.</p>
            </motion.div>
          </div>
        </section>

        {/* Details */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-serif text-4xl text-primary mb-8">The DA Creation Wedding Experience</h2>
                <p className="text-muted-foreground text-lg mb-6 font-light">
                  We understand that an Indian wedding is not just an event, but a union of families and a celebration of heritage. At DA Creation, we respect the sanctity of traditions while infusing them with a contemporary aesthetic.
                </p>
                <ul className="space-y-4">
                  {[
                    "Full Wedding Planning & Coordination",
                    "Design & Décor Styling (Stage, Mandap, Sangeet)",
                    "Ritual & Ceremony Management (Hindu, Sikh, Muslim, Christian)",
                    "Vendor Management & Logistics",
                    "Guest Hospitality & RSVP Management",
                    "Trousseau Packing & Gift Hamper Curation"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground/80">
                      <CheckCircle2 className="text-secondary w-5 h-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[500px]">
                <img src={decorImg} alt="Wedding Decor" className="w-full h-full object-cover shadow-xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary/20 -z-10" />
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
