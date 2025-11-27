import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  eventType: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      eventType: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Inquiry Sent",
      description: "Thank you for contacting Aura Events. We will be in touch shortly.",
    });
    form.reset();
  }

  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div>
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Contact Us</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6">Let’s Create Something Unforgettable</h2>
            <p className="text-muted-foreground text-lg font-light mb-8">
              Whether it's a grand wedding, a corporate gathering, or a private celebration, we’re here to make it extraordinary.
            </p>
            
            <div className="space-y-8 font-light text-foreground/80">
              <div className="flex items-start space-x-4">
                <div className="mt-1 text-primary text-xl">✉️</div>
                <div>
                  <h4 className="font-medium text-foreground">Email</h4>
                  <span>info@auraevents.com</span>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 text-primary text-xl">📞</div>
                <div>
                  <h4 className="font-medium text-foreground">Phone / WhatsApp</h4>
                  <span>+91-9876543210</span>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="mt-1 text-primary text-xl">📍</div>
                <div>
                  <h4 className="font-medium text-foreground">Office</h4>
                  <span>Mumbai, Maharashtra, India<br/><span className="text-sm text-muted-foreground">Available globally for destination events.</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/20 p-8 md:p-10 shadow-sm border border-border/50 relative">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Event Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Wedding, Corporate, etc." {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Your Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your event..." 
                          className="resize-none bg-white min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-none bg-primary hover:bg-primary/90 text-white h-12 text-sm tracking-widest uppercase">
                  Plan Your Event With Us →
                </Button>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </section>
  );
}
