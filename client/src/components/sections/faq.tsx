import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What types of events do you manage?",
    answer: "We specialize in weddings, corporate events (conferences, product launches, award nights, team retreats), private celebrations (birthdays, anniversaries), and destination events across India and internationally."
  },
  {
    question: "Do you handle corporate events and conferences?",
    answer: "Yes, corporate events are one of our core specialties. We manage conferences, seminars, product launches, brand activations, annual corporate events, award ceremonies, executive retreats, and team building activities. We understand business objectives and deliver events that achieve measurable results."
  },
  {
    question: "How early should we book your services?",
    answer: "For weddings, we recommend 6–12 months in advance. For corporate events, 2–6 months is ideal depending on scale. Large conferences may need 6+ months. Private events can be booked 1–3 months ahead."
  },
  {
    question: "Can you handle large-scale corporate conferences?",
    answer: "Absolutely. We have experience managing conferences and events for 50 to 5000+ attendees, including multi-day summits, trade shows, and annual corporate gatherings with complex logistics, AV requirements, and hospitality management."
  },
  {
    question: "Do you offer décor-only or planning-only packages?",
    answer: "Yes. We offer full planning, partial planning, décor styling, and execution-only services based on your specific needs—whether for weddings or corporate events."
  },
  {
    question: "Can you manage events outside India?",
    answer: "Yes. We handle international weddings and corporate events end-to-end, managing all logistics and vendors in destinations like Dubai, Bali, Thailand, and more."
  },
  {
    question: "Do you provide event branding and corporate identity integration?",
    answer: "Yes. For corporate clients, we ensure seamless integration of brand identity, logos, messaging, and corporate values throughout the event experience—from stage design to delegate materials."
  },
  {
    question: "Are your services customizable?",
    answer: "Absolutely. Every event is tailored to your requirements, culture, theme, budget, and business objectives. We don't believe in one-size-fits-all solutions."
  }
];

export function FAQ() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Common Questions</span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary">FAQ</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
              <AccordionTrigger className="font-serif text-lg hover:text-primary text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
