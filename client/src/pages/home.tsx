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
import { SEOHead, useOrganizationSchema, useLocalBusinessSchema } from "@/components/seo/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { useBranding } from "@/contexts/BrandingContext";

export default function Home() {
  const { branding } = useBranding();
  const orgSchema = useOrganizationSchema();
  const localBusinessSchema = useLocalBusinessSchema();
  
  const { data: websiteSettings } = useQuery({
    queryKey: ["/api/settings/website"],
    queryFn: async () => {
      const res = await fetch("/api/settings/website");
      if (!res.ok) return { showPreferredBy: true, showTrustedBy: true };
      return res.json();
    },
  });
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <SEOHead
        pageType="home"
        canonicalUrl={`${branding.domain.url}/`}
        structuredData={{...orgSchema, ...localBusinessSchema}}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyChooseUs />
        <Services />
        <ConsultationCTA />
        <Portfolio />
        <LeadMagnetsSection />
        <Testimonials />
        <FAQ />
        {websiteSettings?.showPreferredBy !== false && <TrustedClients variant="light" />}
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
