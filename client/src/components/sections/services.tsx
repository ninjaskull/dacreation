import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

import weddingImg from "@assets/generated_images/indian_bride_and_groom_minimalist.webp";
import corporateImg from "@assets/generated_images/corporate_conference_stage.webp";
import socialImg from "@assets/generated_images/luxury_private_dinner.webp";
import destImg from "@assets/generated_images/destination_event_beach.webp";

const serviceData = {
  corporate: {
    title: "Corporate Events",
    description: "Professional, polished, and impact-driven events—from conferences to award shows. We understand business objectives and deliver measurable results.",
    image: corporateImg,
    link: "/services/corporate",
    features: [
      "Conferences, Seminars & Summits",
      "Product Launches & Brand Activations",
      "Annual Events, Award Nights & Galas",
      "Corporate Retreats & Team Building",
      "Executive Meetings & Board Events",
      "Trade Shows & Exhibition Management"
    ]
  },
  weddings: {
    title: "Weddings & Cultural Celebrations",
    description: "Modern design meets rich Indian tradition. We plan every ritual, ceremony, and moment effortlessly.",
    image: weddingImg,
    link: "/services/weddings",
    features: [
      "Full Wedding Planning & Coordination",
      "Design & Décor Styling (Stage, Mandap, Sangeet)",
      "Ritual & Ceremony Management (Hindu, Sikh, Muslim, Christian)",
      "Vendor Management & Logistics"
    ]
  },
  social: {
    title: "Social Events & Private Parties",
    description: "Birthdays, anniversaries, baby showers, proposals, and everything worth celebrating.",
    image: socialImg,
    link: "/services/social",
    features: [
      "Birthdays, Anniversaries & Private Parties",
      "Baby Showers & Naming Ceremonies",
      "Luxury Private Dinners & Home Events",
      "Theme-based Décor & Entertainment"
    ]
  },
  destination: {
    title: "Destination Events",
    description: "Pan-India and international event planning with complete logistics and hospitality management.",
    image: destImg,
    link: "/services/destination",
    features: [
      "Pan-India Locations (Goa, Jaipur, Udaipur, Kerala)",
      "International Planning (Dubai, Bali, Thailand)",
      "Travel & Accommodation Management",
      "Hospitality Desks & Guest Logistics"
    ]
  }
};

export function Services() {
  return (
    <section id="services" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">What We Do</span>
          <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6">Our Services</h2>
          <p className="text-muted-foreground text-lg font-light">
            From corporate excellence to wedding dreams—we blend creative design, structured planning, and professional execution to transform visions into beautifully orchestrated events.
          </p>
        </div>

        <Tabs defaultValue="corporate" className="w-full">
          <div className="flex justify-start md:justify-center mb-12 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar">
            <TabsList className="bg-transparent h-auto gap-4 md:gap-8 flex-nowrap w-max md:w-auto">
              {Object.keys(serviceData).map((key) => (
                <TabsTrigger 
                  key={key}
                  value={key}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-4 px-2 md:px-6 font-serif text-lg md:text-xl text-muted-foreground data-[state=active]:text-primary transition-all"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(serviceData).map(([key, data]) => (
            <TabsContent key={key} value={key} className="mt-0 outline-none">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="order-2 lg:order-1">
                  <h3 className="font-serif text-3xl md:text-4xl mb-6 text-foreground">{data.title}</h3>
                  <p className="text-lg text-muted-foreground font-light mb-8 leading-relaxed">
                    {data.description}
                  </p>
                  <ul className="space-y-4 mb-10">
                    {data.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-foreground/80 font-light">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-4"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center">
                    <Link href={data.link}>
                      <Button className="rounded-none bg-primary hover:bg-primary/90 text-white px-8 py-6 group">
                        Explore {data.title} <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="order-1 lg:order-2 relative h-[400px] md:h-[500px]">
                  <div className="absolute inset-0 bg-secondary/10 transform translate-x-4 translate-y-4 -z-10"></div>
                  <img 
                    src={data.image} 
                    alt={data.title} 
                    className="w-full h-full object-cover shadow-lg"
                  />
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
