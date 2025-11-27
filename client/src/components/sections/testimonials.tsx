import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    text: "A corporate event executed with absolute professionalism—impressive staging, management, and creativity.",
    author: "Fortune 500 Client",
    role: "Corporate Event"
  },
  {
    text: "Our wedding was magical. Every detail reflected our culture and personality. Couldn’t have asked for better.",
    author: "Aarav & Meera",
    role: "Wedding"
  },
  {
    text: "From décor to guest hospitality, my 50th birthday party felt luxurious and personal.",
    author: "Radhika S.",
    role: "Birthday Celebration"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-primary text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] border-[50px] border-white rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Quote className="w-12 h-12 mx-auto mb-6 text-secondary opacity-80" />
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Client Testimonials</h2>
          <p className="text-white/70 font-light max-w-xl mx-auto">
            We take pride in the experiences we create and the trust we earn. Here's what our clients say about working with us.
          </p>
        </div>

        <Carousel className="max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((item, index) => (
              <CarouselItem key={index}>
                <div className="text-center px-4 md:px-12 py-4">
                  <p className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8 opacity-90">
                    "{item.text}"
                  </p>
                  <div>
                    <h4 className="text-secondary text-lg font-medium uppercase tracking-widest">{item.author}</h4>
                    <span className="text-white/60 text-sm block mt-1">{item.role}</span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex bg-transparent border-white/20 text-white hover:bg-white hover:text-primary" />
          <CarouselNext className="hidden md:flex bg-transparent border-white/20 text-white hover:bg-white hover:text-primary" />
        </Carousel>
      </div>
    </section>
  );
}
