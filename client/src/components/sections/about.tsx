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
        <div className="flex flex-col lg:flex-row items-start gap-16">
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/5] bg-muted relative overflow-hidden">
              <img 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" 
                  alt="Aura Team" 
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-8">
                 <p className="text-white font-serif italic text-xl">"Every event deserves precision, passion, and artistry."</p>
              </div>
            </div>
            <div className="absolute -top-8 -left-8 w-32 h-32 border-t-2 border-l-2 border-primary/20 -z-10"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 border-b-2 border-r-2 border-primary/20 -z-10"></div>
          </div>

          <div className="lg:w-1/2">
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Who We Are</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-8">More Than Just Planners</h2>
            
            <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed mb-10">
              <p>
                DA Creation is a full-service event management company known for combining meticulous planning with world-class design. What began as a wedding planning brand has evolved into a complete event management studio trusted by families, multinational corporations, and individuals looking for excellence.
              </p>
              <p>
                Our philosophy is simple: whether you’re planning a multi-day wedding, a product launch, a milestone birthday, or a corporate retreat, we bring creativity, cultural understanding, and flawless execution to every detail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="font-serif text-xl text-foreground mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground font-light">To create culturally rich, aesthetically modern, and emotionally meaningful events that feel effortless for our clients and extraordinary for their guests.</p>
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground mb-2">Our Team</h3>
                <p className="text-sm text-muted-foreground font-light">A diverse team of planners, designers, production experts, and logistics managers working together to deliver seamless experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
