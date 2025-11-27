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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  date: z.string().optional(),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      date: "",
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
    <section id="contact" className="py-24 bg-background relative">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div>
            <span className="text-secondary uppercase tracking-widest text-sm font-medium mb-4 block">Get in Touch</span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-6">Begin Your Journey</h2>
            <p className="text-muted-foreground text-lg font-light mb-8">
              Let's discuss how we can bring your vision to life. Schedule a consultation with our expert planners today.
            </p>
            
            <div className="space-y-6 font-light text-foreground/80">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  ✉️
                </div>
                <span>hello@auraevents.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  📞
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  📍
                </div>
                <span>Beverly Hills, CA</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 shadow-xl border border-border/50 relative">
            <div className="absolute -top-2 -right-2 w-20 h-20 border-t-2 border-r-2 border-secondary opacity-50"></div>
            <div className="absolute -bottom-2 -left-2 w-20 h-20 border-b-2 border-l-2 border-secondary opacity-50"></div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} className="border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent" />
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
                        <Input placeholder="your@email.com" {...field} className="border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Tentative Wedding Date</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/YYYY" {...field} className="border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent" />
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
                      <FormLabel className="uppercase text-xs tracking-widest text-foreground/60">Your Vision</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your dream wedding..." 
                          className="resize-none border-0 border-b border-input rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-none bg-primary hover:bg-primary/90 text-white h-12 text-sm tracking-widest uppercase">
                  Send Inquiry
                </Button>
              </form>
            </Form>
          </div>

        </div>
      </div>
    </section>
  );
}
