import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { FileText, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

export default function TermsOfServicePage() {
  const { branding } = useBranding();
  const lastUpdated = "December 08, 2024";

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="about"
        title={`Terms of Service | ${branding.company.name}`}
        description={`Terms of Service for ${branding.company.name}. Read our terms and conditions for event management services in Maharashtra, India.`}
        canonicalUrl={`${branding.domain.url}/terms-of-service`}
        structuredData={getBreadcrumbSchema(branding, [
          { name: "Home", url: branding.domain.url },
          { name: "Terms of Service", url: `${branding.domain.url}/terms-of-service` }
        ])}
      />
      <Navbar />
      
      <section className="relative pt-32 lg:pt-40 pb-16 bg-gradient-to-br from-[#601a29] via-[#7a2233] to-[#4a1320] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.3),transparent_70%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              data-testid="text-page-title"
            >
              Terms of Service
            </h1>
            <p className="text-lg text-white/80">
              Last Updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="mb-8 gap-2" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>

            <div className="prose prose-lg max-w-none text-gray-700">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction and Acceptance</h2>
                <p>
                  Welcome to {branding.company.name}. These Terms of Service ("Terms") govern your use of our website and event management services. By accessing our website or engaging our services, you agree to be bound by these Terms, our Privacy Policy, and all applicable laws and regulations.
                </p>
                <p>
                  {branding.company.name} is an event management company registered and operating in Maharashtra, India. Our services are governed by the laws of India, including but not limited to the Indian Contract Act, 1872, the Consumer Protection Act, 2019, and applicable state regulations.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>"Company"</strong> refers to {branding.company.name}, its owners, employees, and authorized representatives</li>
                  <li><strong>"Client"</strong> refers to any individual or entity engaging our event management services</li>
                  <li><strong>"Services"</strong> refers to event planning, management, coordination, and related services offered by the Company</li>
                  <li><strong>"Event"</strong> refers to weddings, corporate events, social celebrations, destination events, or any other function managed by the Company</li>
                  <li><strong>"Vendor"</strong> refers to third-party service providers including venues, caterers, decorators, photographers, and other suppliers</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Services Offered</h2>
                <p>We provide comprehensive event management services including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Wedding planning and coordination</li>
                  <li>Corporate event management</li>
                  <li>Social celebrations and parties</li>
                  <li>Destination event planning</li>
                  <li>Vendor selection and management</li>
                  <li>Venue scouting and booking assistance</li>
                  <li>Theme design and decor planning</li>
                  <li>Day-of coordination and execution</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Booking and Payment Terms</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Booking Process</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All bookings require a signed service agreement and advance payment</li>
                  <li>A non-refundable booking amount of 25-50% of the total service fee is required to confirm the event date</li>
                  <li>Final payment is due 7 days before the event date unless otherwise agreed in writing</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Payment Methods</h3>
                <p>We accept payments through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bank transfer (NEFT/RTGS/IMPS)</li>
                  <li>UPI payments</li>
                  <li>Cheque (subject to clearance)</li>
                  <li>Credit/Debit cards through authorized payment gateways</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 GST and Taxes</h3>
                <p>
                  All service fees are subject to Goods and Services Tax (GST) at applicable rates as per the GST Act, 2017. GST will be charged in addition to the quoted service fees and will be clearly mentioned in the invoice.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.4 Quotation Validity</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All quotations are valid for 15 days from the date of issue unless otherwise specified</li>
                  <li>Prices may be revised after the validity period due to changes in vendor costs or market conditions</li>
                  <li>Custom quotations for specific services are valid only for the event mentioned therein</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.5 Payment Schedule</h3>
                <div className="bg-gray-50 rounded-xl p-4 my-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Milestone</th>
                        <th className="text-left py-2 font-semibold">Percentage</th>
                        <th className="text-left py-2 font-semibold">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Booking Confirmation</td>
                        <td className="py-2">25-50%</td>
                        <td className="py-2">At contract signing</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Second Installment</td>
                        <td className="py-2">25-40%</td>
                        <td className="py-2">30 days before event</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">Final Payment</td>
                        <td className="py-2">Remaining balance</td>
                        <td className="py-2">7 days before event</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  * Actual percentages may vary based on event scope and will be specified in the service agreement.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Cancellation and Refund Policy</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Cancellation by Client</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>More than 90 days before event:</strong> 50% of advance payment refundable</li>
                  <li><strong>60-90 days before event:</strong> 25% of advance payment refundable</li>
                  <li><strong>30-60 days before event:</strong> No refund of advance payment</li>
                  <li><strong>Less than 30 days before event:</strong> Full payment is due; no refunds</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Cancellation by Company</h3>
                <p>
                  In the unlikely event that we need to cancel our services due to unforeseen circumstances, we will provide full refund of all amounts paid, excluding any third-party vendor deposits that cannot be recovered.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Force Majeure</h3>
                <p>
                  Neither party shall be liable for cancellation or postponement due to events beyond reasonable control, including but not limited to natural disasters, government orders, pandemic restrictions, civil unrest, or any other force majeure event.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Client Responsibilities</h2>
                <p>The Client agrees to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information about the event requirements</li>
                  <li>Make timely decisions and approvals as required for event planning</li>
                  <li>Ensure timely payments as per the agreed schedule</li>
                  <li>Obtain necessary permits and approvals for the event (with our assistance if agreed)</li>
                  <li>Comply with venue rules and regulations</li>
                  <li>Ensure the safety and security of guests during the event</li>
                  <li>Provide accurate guest count at least 15 days before the event</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Company Responsibilities</h2>
                <p>We commit to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide professional event management services as per the agreed scope</li>
                  <li>Assign a dedicated project manager for your event</li>
                  <li>Coordinate with vendors and suppliers on your behalf</li>
                  <li>Maintain regular communication throughout the planning process</li>
                  <li>Ensure compliance with applicable permits and licenses for the event</li>
                  <li>Provide on-site coordination during the event</li>
                  <li>Handle emergencies and contingencies professionally</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Third-Party Vendors</h2>
                <p>
                  While we carefully select and recommend vendors, we act as intermediaries and are not responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Performance failures or service deficiencies by third-party vendors</li>
                  <li>Vendor cancellations or no-shows beyond our control</li>
                  <li>Quality of food, products, or services provided by vendors</li>
                  <li>Damages or injuries caused by vendor equipment or services</li>
                </ul>
                <p className="mt-4">
                  We will, however, make every reasonable effort to resolve vendor-related issues and arrange alternatives when possible.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Intellectual Property</h2>
                <p>
                  All content on our website, including text, images, logos, designs, and documentation, is the intellectual property of {branding.company.name} and is protected under the Copyright Act, 1957, and Trademark Act, 1999. Unauthorized use, reproduction, or distribution is prohibited.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Liability Limitations and Indemnity</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.1 Liability Cap</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Our maximum aggregate liability for any claims arising from our services shall not exceed the total service fees actually paid by the Client for the specific event</li>
                  <li>This limitation applies to all claims, whether based on contract, negligence, strict liability, or any other legal theory</li>
                  <li>We are not liable for indirect, consequential, incidental, special, or punitive damages</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.2 Exclusions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal injury or property damage during events unless caused by our direct and proven negligence</li>
                  <li>Weather-related impacts on outdoor events</li>
                  <li>Acts or omissions of third-party vendors not directly employed by us</li>
                  <li>Loss of profits, business opportunities, or goodwill</li>
                  <li>Data loss or interruption of services due to technical failures</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.3 Client Indemnification</h3>
                <p>The Client agrees to indemnify, defend, and hold harmless {branding.company.name}, its officers, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses arising from:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Client's breach of these Terms or any applicable laws</li>
                  <li>The Client's negligent or wrongful acts during the event</li>
                  <li>Claims by third parties (including guests) for injury or damage not caused by Company negligence</li>
                  <li>The Client's failure to obtain required permits or approvals</li>
                  <li>Content or materials provided by the Client that infringe third-party rights</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Consumer Protection Rights</h2>
                <p>
                  As per the Consumer Protection Act, 2019, you have the following rights:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right to be Protected:</strong> Against marketing of services that are hazardous to your interests</li>
                  <li><strong>Right to be Informed:</strong> About the quality, quantity, standard, and price of our services</li>
                  <li><strong>Right to Choose:</strong> Access to a variety of service packages at competitive prices</li>
                  <li><strong>Right to be Heard:</strong> Your complaints and concerns will be addressed promptly</li>
                  <li><strong>Right to Seek Redressal:</strong> Fair settlement of genuine grievances</li>
                  <li><strong>Right to Consumer Education:</strong> Awareness about your rights and responsibilities</li>
                </ul>
                <p className="mt-4">
                  <strong>Consumer Grievance Redressal:</strong> If you have any complaints about our services, please contact our Grievance Officer. If your complaint is not resolved within 30 days, you may approach the District Consumer Disputes Redressal Forum, State Consumer Disputes Redressal Commission, or National Consumer Disputes Redressal Commission as applicable under the Consumer Protection Act, 2019.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">12. Permits and Compliance</h2>
                <p>
                  Events in Maharashtra require various permits and licenses. We assist in obtaining:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Police NOC for large gatherings</li>
                  <li>Fire Department NOC for venue safety</li>
                  <li>Municipal Corporation permissions</li>
                  <li>Noise pollution permits (if applicable)</li>
                  <li>FSSAI compliance for catering</li>
                  <li>Music licensing (PPL/IPRS)</li>
                </ul>
                <p className="mt-4">
                  Additional permits for alcohol service, traffic management, or special requirements may be required based on the event nature and venue.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">13. Dispute Resolution</h2>
                <p>
                  Any disputes arising from these Terms or our services shall be:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>First, attempted to be resolved through good-faith negotiation between parties</li>
                  <li>If unresolved within 30 days, referred to mediation</li>
                  <li>If mediation fails, subject to arbitration under the Arbitration and Conciliation Act, 1996</li>
                  <li>Arbitration shall be conducted in Mumbai, Maharashtra, in English</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">14. Governing Law and Jurisdiction</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">15. Modifications to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective upon posting on our website. Continued use of our services after changes constitutes acceptance of the modified Terms.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-gray-50 rounded-2xl p-8 mt-10 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">16. Contact Information</h2>
                <p className="mb-6">
                  For any questions regarding these Terms or our services, please contact us:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#601a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#601a29]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{branding.company.name}</p>
                      <p className="text-gray-600">Event Management Company</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#601a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-[#601a29]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a href={`mailto:${branding.contact.email}`} className="text-[#601a29] hover:underline">
                        {branding.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#601a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#601a29]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-gray-600">{branding.contact.phones[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#601a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#601a29]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Registered Office</p>
                      <p className="text-gray-600 whitespace-pre-line">{branding.addresses.primary.full}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="mt-10 text-center"
              >
                <p className="text-gray-600">
                  By using our website or engaging our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
