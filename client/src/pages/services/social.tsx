import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import heroImage from "@assets/generated_images/luxury_private_dinner.png";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <Navbar />
      <main className="pt-20 lg:pt-28">
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Social Events" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 text-center text-white px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-5xl md:text-7xl mb-6">Social Events & Private Parties</h1>
              <p className="text-xl font-light max-w-2xl mx-auto">Birthdays, anniversaries, baby showers, proposals, and everything worth celebrating.</p>
            </motion.div>
          </div>
        </section>

        {/* Details */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-serif text-4xl text-primary mb-8">Intimate Gatherings, Grand Memories</h2>
                <p className="text-muted-foreground text-lg mb-6 font-light">
                  Whether it's a milestone birthday or a cozy family gathering, DA Creation adds a touch of magic to your personal celebrations. We handle the details so you can be a guest at your own party.
                </p>
                <ul className="space-y-4">
                  {[
                    "Birthdays, Anniversaries & Private Parties",
                    "Baby Showers & Naming Ceremonies",
                    "Luxury Private Dinners & Home Events",
                    "Theme-based Décor & Entertainment",
                    "Proposal Planning",
                    "Catering & Menu Curation"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground/80">
                      <CheckCircle2 className="text-secondary w-5 h-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[500px]">
                <img src="https://images.unsplash.com/photo-1530103862676-de3c9a59af57?q=80&w=2070&auto=format&fit=crop" alt="Party Vibes" className="w-full h-full object-cover shadow-xl" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 -z-10" />
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
