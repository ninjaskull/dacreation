import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LeadCaptureWizard } from "@/components/sales/lead-capture-wizard";
import { Check } from "lucide-react";
import { SEOHead, SEO_DATA, getBreadcrumbSchema } from "@/components/seo/SEOHead";

export default function InquirePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">
      <SEOHead
        title={SEO_DATA.inquire.title}
        description={SEO_DATA.inquire.description}
        keywords={SEO_DATA.inquire.keywords}
        canonicalUrl="https://dacreation.com/inquire"
        structuredData={getBreadcrumbSchema([
          { name: "Home", url: "https://dacreation.com" },
          { name: "Book Event", url: "https://dacreation.com/inquire" }
        ])}
      />
      <Navbar />
      <main className="pt-28 lg:pt-36 pb-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Left Column: Value Prop */}
            <div className="lg:w-5/12">
              <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Start Your Journey</span>
              <h1 className="font-serif text-4xl md:text-5xl text-primary mb-6 leading-tight">
                Let's Plan Your <br/>Dream Celebration
              </h1>
              <p className="text-lg text-muted-foreground font-light mb-10 leading-relaxed">
                Fill out the form to get a customized proposal for your event. Our team specializes in creating seamless, culturally rich experiences tailored to your unique vision.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-secondary">
                    <span className="font-serif font-bold text-xl">1</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">Share Your Vision</h3>
                    <p className="text-sm text-muted-foreground">Tell us about your event type, tentative dates, and guest count.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-secondary">
                    <span className="font-serif font-bold text-xl">2</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">Get a Custom Proposal</h3>
                    <p className="text-sm text-muted-foreground">We'll curate a preliminary plan and budget estimate for you.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-secondary">
                    <span className="font-serif font-bold text-xl">3</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">Consultation Call</h3>
                    <p className="text-sm text-muted-foreground">Speak with our lead planner to refine the details.</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary text-white p-6 rounded-lg relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
                <p className="font-serif italic text-lg relative z-10">
                  "DA Creation handled everything flawlessly. The best decision we made for our wedding!"
                </p>
                <p className="text-sm mt-4 opacity-80 relative z-10">— Priya & Rahul, 2024</p>
              </div>
            </div>

            {/* Right Column: The Wizard */}
            <div className="lg:w-7/12">
              <LeadCaptureWizard />
            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
