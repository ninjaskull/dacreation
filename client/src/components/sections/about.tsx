import { Button } from "@/components/ui/button";
import mandala from "@assets/generated_images/subtle_mandala_texture_background.png";

export function About() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ 
          backgroundImage: `url(${mandala})`, 
          backgroundSize: '600px',
          backgroundRepeat: 'repeat' 
        }}
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 relative">
            <div className="aspect-[4/5] bg-muted relative overflow-hidden">
              {/* Placeholder for Founder/Team Image - using a colored block for now or a stock image if I had one. 
                  I'll use a nice gradient/text block or one of the detail shots */}
              <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400">
                 {/* Using a detail shot instead of a person for now as I didn't generate a person */}
                 <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
                  alt="Aura Team" 
                  className="w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
                 />
              </div>
              <div className="absolute top-8 right-8 w-24 h-24 bg-white/90 backdrop-blur flex items-center justify-center p-4 shadow-lg">
                 <span className="font-serif text-3xl text-primary">10+</span>
                 <span className="text-xs uppercase tracking-widest absolute bottom-2">Years</span>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-64 h-64 border-[20px] border-secondary/20 -z-10"></div>
          </div>

          <div className="md:w-1/2">
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Our Story</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-8">Weaving Dreams into Reality</h2>
            
            <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
              <p>
                At Aura Events, we believe that a wedding is not just an event; it is a symphony of emotions, traditions, and personal style. Founded on the principles of refined elegance and cultural authenticity, we specialize in curating modern Indian weddings that are as unique as the couples we serve.
              </p>
              <p>
                Our mission is to strip away the chaos and clutter, leaving only what matters: love, joy, and beauty. We blend the grandeur of Indian traditions with a minimalist, contemporary aesthetic to create celebrations that feel timeless and sophisticated.
              </p>
            </div>

            <div className="mt-10 flex items-center space-x-4">
              <div className="h-px w-16 bg-primary"></div>
              <span className="font-serif text-xl text-primary italic">The Aura Team</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
