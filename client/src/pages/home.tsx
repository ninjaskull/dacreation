import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { Portfolio } from "@/components/sections/portfolio";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { LeadMagnetsSection } from "@/components/sales/lead-magnets";
import { ConsultationCTA } from "@/components/sales/consultation-cta";
import { TrustedClients } from "@/components/sections/trusted-clients";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <TrustedClients variant="light" />
        <About />
        <WhyChooseUs />
        <Services />
        <ConsultationCTA />
        <Portfolio />
        <LeadMagnetsSection />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
