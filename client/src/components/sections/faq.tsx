import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do you only plan weddings?",
    answer: "No. We plan weddings, corporate events, private celebrations, and destination events."
  },
  {
    question: "How early should we book your services?",
    answer: "For weddings, we recommend 6–12 months in advance. For corporate events, 2–6 months is ideal. Private events can be booked 1–3 months ahead."
  },
  {
    question: "Do you offer décor-only or planning-only packages?",
    answer: "Yes. We offer full planning, partial planning, décor styling, and execution-only services based on your specific needs."
  },
  {
    question: "Can you manage events outside India?",
    answer: "Yes. We handle international weddings and corporate events end-to-end, managing all logistics and vendors."
  },
  {
    question: "Are your services customizable?",
    answer: "Absolutely. Every event is tailored to your requirements, culture, theme, and budget."
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
