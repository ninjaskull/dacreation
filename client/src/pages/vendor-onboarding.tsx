import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  Star, 
  CheckCircle2,
  ArrowRight,
  Handshake,
  Award,
  Calendar,
  IndianRupee,
  Clock,
  Heart,
  Sparkles,
  FileCheck,
  UserCheck,
  BadgeCheck
} from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

const benefits = [
  {
    icon: Users,
    title: "Access Premium Clients",
    description: "Connect with high-value clients seeking quality vendors for their weddings and corporate events."
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Increase your visibility and bookings through our extensive network and marketing reach."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Timely and transparent payment processing with clear terms and professional invoicing."
  },
  {
    icon: Award,
    title: "Build Your Reputation",
    description: "Showcase your work in our portfolio and gain testimonials from satisfied clients."
  },
  {
    icon: Calendar,
    title: "Consistent Bookings",
    description: "Receive regular event opportunities throughout the year across multiple categories."
  },
  {
    icon: Handshake,
    title: "Long-term Partnership",
    description: "Join our preferred vendor network for exclusive opportunities and priority assignments."
  }
];

const vendorCategories = [
  "Decorators & Florists",
  "Caterers & Chefs",
  "Photographers & Videographers",
  "Makeup Artists & Stylists",
  "DJs & Entertainment",
  "Venue Partners",
  "Transportation Services",
  "Mehendi & Henna Artists",
  "Wedding Planners",
  "Sound & Lighting",
  "Invitation & Stationery",
  "Rental Services"
];

const processSteps = [
  {
    step: 1,
    icon: FileCheck,
    title: "Submit Application",
    description: "Fill out our vendor registration form with your business details and portfolio."
  },
  {
    step: 2,
    icon: UserCheck,
    title: "Verification",
    description: "Our team reviews your application, credentials, and work samples."
  },
  {
    step: 3,
    icon: BadgeCheck,
    title: "Onboarding",
    description: "Once approved, complete the onboarding process and sign our partnership agreement."
  },
  {
    step: 4,
    icon: Star,
    title: "Start Collaborating",
    description: "Receive event opportunities and start working with our premium clients."
  }
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    company: "Royal Decorators",
    category: "Decoration",
    quote: "Partnering with them has transformed our business. We've seen a 40% increase in high-value bookings.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    company: "Lens & Light Studios",
    category: "Photography",
    quote: "The quality of clients we get through this partnership is exceptional. Highly recommend joining.",
    rating: 5
  },
  {
    name: "Mohammed Ali",
    company: "Spice Symphony Caterers",
    category: "Catering",
    quote: "Professional team, timely payments, and consistent opportunities. A true partnership that values vendors.",
    rating: 5
  }
];

const stats = [
  { value: "200+", label: "Partner Vendors" },
  { value: "500+", label: "Events Annually" },
  { value: "98%", label: "Vendor Satisfaction" },
  { value: "15+", label: "Cities Covered" }
];

export default function VendorOnboardingPage() {
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              Partner With Us
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              data-testid="text-page-title"
            >
              Grow Your Business with {branding.company.name}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Join India's premier event management network. Access premium clients, 
              grow your revenue, and be part of creating unforgettable celebrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vendor-registration">
                <Button 
                  size="lg" 
                  className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white min-w-[200px]"
                  data-testid="button-hero-register"
                >
                  Register Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#benefits">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-full gap-2 border-white/30 text-white hover:bg-white/10 min-w-[200px]"
                  data-testid="button-hero-learn-more"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative -mt-16 z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                  data-testid={`stat-${index}`}
                >
                  <div className="text-3xl md:text-4xl font-bold text-[#601a29] mb-1">
                    {stat.value}
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Why Partner With Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Benefits of Joining Our Network</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We value our vendor partners and provide comprehensive support to help your business thrive
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                data-testid={`benefit-card-${index}`}
              >
                <div className="w-14 h-14 bg-[#601a29]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#601a29] group-hover:scale-110 transition-all duration-300">
                  <benefit.icon className="w-7 h-7 text-[#601a29] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Vendor Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">We're Looking for Partners In</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're an established business or a growing professional, we welcome vendors across various event service categories
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {vendorCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-5 py-3 bg-gradient-to-r from-[#601a29]/5 to-[#d4af37]/5 rounded-full border border-[#601a29]/10 hover:border-[#601a29]/30 hover:shadow-md transition-all cursor-default"
                data-testid={`category-${index}`}
              >
                <span className="text-gray-800 font-medium">{category}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 mb-4">Don't see your category? We're always looking for unique talents!</p>
            <Link href="/vendor-registration">
              <Button variant="outline" className="rounded-full gap-2" data-testid="button-register-category">
                Register & Let Us Know
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">The Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">How to Become a Partner</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Our simple 4-step process makes it easy to join our trusted vendor network
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
                data-testid={`process-step-${index}`}
              >
                <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <step.icon className="w-8 h-8 text-[#601a29]" />
                </div>
                <div className="absolute top-8 left-[60%] w-[80%] h-0.5 bg-[#d4af37]/30 hidden lg:block" style={{ display: index === processSteps.length - 1 ? 'none' : undefined }} />
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[#d4af37] text-sm font-medium mb-3">
                  Step {step.step}
                </span>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Success Stories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">What Our Vendors Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from vendors who have grown their business through our partnership
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                data-testid={`testimonial-${index}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#d4af37] text-[#d4af37]" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#601a29] to-[#d4af37] flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company} • {testimonial.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Requirements</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">What We Look For</h2>
              <p className="text-gray-600 mb-8">
                We partner with vendors who share our commitment to excellence and client satisfaction.
              </p>
              <ul className="space-y-4">
                {[
                  "Valid business registration (GST/PAN)",
                  "Minimum 2 years of industry experience",
                  "Portfolio showcasing your work",
                  "Professional approach and punctuality",
                  "Commitment to quality and client satisfaction",
                  "Willingness to maintain our service standards"
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                    data-testid={`requirement-${index}`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#601a29] to-[#7a2233] rounded-2xl p-8 md:p-10 text-white"
            >
              <Sparkles className="w-10 h-10 text-[#d4af37] mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-white/80 leading-relaxed mb-6">
                Join our network of trusted vendors and start receiving opportunities 
                to work with premium clients across India.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Free registration</span>
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>No hidden fees</span>
                </li>
                <li className="flex items-center gap-2 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Transparent terms</span>
                </li>
              </ul>
              <Link href="/vendor-registration">
                <Button 
                  size="lg" 
                  className="w-full rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white"
                  data-testid="button-register-cta"
                >
                  Register as a Vendor
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#d4af37] font-medium uppercase tracking-wider text-sm">Common Questions</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Is there a registration fee?",
                a: "No, registration is completely free. We only work on a project-based collaboration model."
              },
              {
                q: "How long does the verification process take?",
                a: "Typically 3-5 business days. Our team reviews your application, portfolio, and credentials thoroughly."
              },
              {
                q: "What commission does the company charge?",
                a: "Commission varies by category and project type. Details are shared during the onboarding process."
              },
              {
                q: "Can I work with other event companies while partnered with you?",
                a: "Yes, we don't have exclusivity requirements. You're free to work with other clients and companies."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-100"
                data-testid={`faq-${index}`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.4)_0%,transparent_50%)]" />
            </div>
            <div className="relative z-10">
              <Building2 className="w-16 h-16 text-[#d4af37] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join Our Vendor Network Today
              </h2>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto text-lg">
                Take the first step towards growing your business. Register now and 
                become part of {branding.company.name}'s trusted vendor family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/vendor-registration">
                  <Button 
                    size="lg" 
                    className="rounded-full gap-2 bg-[#d4af37] hover:bg-[#c5a030] text-white min-w-[200px]"
                    data-testid="button-final-register"
                  >
                    Register Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-full gap-2 border-white/30 text-white hover:bg-white/10 min-w-[200px]"
                    data-testid="button-contact-team"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
