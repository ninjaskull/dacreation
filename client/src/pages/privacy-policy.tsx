import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Shield, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

export default function PrivacyPolicyPage() {
  const { branding } = useBranding();
  const lastUpdated = "December 08, 2024";

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="about"
        title={`Privacy Policy | ${branding.company.name}`}
        description={`Privacy Policy for ${branding.company.name}. Learn how we collect, use, and protect your personal data in compliance with Indian IT Act 2000 and DPDP Act 2023.`}
        canonicalUrl={`${branding.domain.url}/privacy-policy`}
        structuredData={getBreadcrumbSchema(branding, [
          { name: "Home", url: branding.domain.url },
          { name: "Privacy Policy", url: `${branding.domain.url}/privacy-policy` }
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
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              data-testid="text-page-title"
            >
              Privacy Policy
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  Welcome to {branding.company.name} ("{branding.company.name}", "we", "our", or "us"). We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our event management services.
                </p>
                <p>
                  This policy is drafted in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("IT Rules"), and the Digital Personal Data Protection Act, 2023 ("DPDP Act") of India.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Information We Collect</h2>
                <p>We collect the following types of personal data:</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Information You Provide Directly</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, and postal address</li>
                  <li><strong>Event Details:</strong> Event type, date, venue preferences, guest count, and budget range</li>
                  <li><strong>Communication Records:</strong> Messages, inquiries, and feedback submitted through our website or other channels</li>
                  <li><strong>Payment Information:</strong> Billing details for service payments (processed through secure payment gateways)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and navigation patterns</li>
                  <li><strong>Cookies and Tracking Technologies:</strong> Information collected through cookies, web beacons, and similar technologies</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Purpose of Data Collection</h2>
                <p>We use your personal data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and manage event planning and management services</li>
                  <li>To respond to your inquiries and communicate about your event requirements</li>
                  <li>To process payments and maintain financial records</li>
                  <li>To send service updates, promotional offers, and newsletters (with your consent)</li>
                  <li>To improve our website and services based on user feedback and analytics</li>
                  <li>To comply with legal obligations and regulatory requirements</li>
                  <li>To prevent fraud and ensure the security of our services</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Legal Basis for Processing</h2>
                <p>Under the DPDP Act, 2023, we process your personal data based on:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Consent:</strong> Where you have provided explicit, informed consent for specific purposes</li>
                  <li><strong>Contractual Necessity:</strong> Where processing is necessary to fulfill our service agreement with you</li>
                  <li><strong>Legal Obligation:</strong> Where we are required to process data to comply with applicable laws</li>
                  <li><strong>Legitimate Interests:</strong> For business purposes such as improving our services and preventing fraud</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Data Sharing and Disclosure</h2>
                <p>We may share your personal data with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> Vendors, venues, caterers, decorators, and other partners involved in delivering your event</li>
                  <li><strong>Payment Processors:</strong> Third-party payment gateways for secure transaction processing</li>
                  <li><strong>Legal Authorities:</strong> Government agencies, courts, or regulatory bodies when required by law</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of business assets</li>
                </ul>
                <p className="mt-4">
                  We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Data Security</h2>
                <p>
                  We implement reasonable security practices and procedures as mandated under the IT Rules, 2011, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of sensitive data during transmission and storage</li>
                  <li>Access controls and authentication measures</li>
                  <li>Regular security assessments and audits</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response procedures for data breaches</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Data Retention</h2>
                <p>
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable laws. Event-related data is typically retained for 7 years for accounting and legal compliance purposes.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Your Rights (Data Principal Rights)</h2>
                <p>Under the DPDP Act, 2023, as a Data Principal, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right to Access:</strong> Request a summary of your personal data being processed and the processing activities undertaken</li>
                  <li><strong>Right to Correction:</strong> Request correction of inaccurate, incomplete, or outdated personal data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data when it is no longer necessary for the purpose it was collected, subject to legal retention requirements</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time with the same ease as it was given. Withdrawal does not affect the lawfulness of processing done prior to withdrawal</li>
                  <li><strong>Right to Grievance Redressal:</strong> File complaints with our Grievance Officer, and if unsatisfied, escalate to the Data Protection Board of India</li>
                  <li><strong>Right to Nominate:</strong> Nominate any individual who shall exercise your rights in the event of your death or incapacity</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8.1 How to Exercise Your Rights</h3>
                <p>To exercise any of your rights, you may:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email our Grievance Officer at the contact provided below</li>
                  <li>Call us during business hours (Monday to Saturday, 10 AM - 7 PM IST)</li>
                  <li>Submit a written request at our registered office address</li>
                </ul>
                <p className="mt-4">We will respond to your request within 7 days and complete the action within 30 days unless extended due to complexity.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">8.2 How to Withdraw Consent</h3>
                <p>You can withdraw your consent for data processing by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sending an email to our Grievance Officer with subject "Consent Withdrawal Request"</li>
                  <li>Clicking the "Unsubscribe" link in any marketing email</li>
                  <li>Contacting us through our website's contact form</li>
                </ul>
                <p className="mt-4">Upon receiving your withdrawal request, we will stop processing your data for the purposes you have withdrawn consent for within 7 working days. Note that withdrawal may affect our ability to provide certain services.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Data Breach Notification</h2>
                <p>In the event of a personal data breach, we will:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Notify the Data Protection Board of India within 72 hours of becoming aware of the breach</li>
                  <li>Inform affected Data Principals as soon as practicable about the nature, scope, and potential consequences of the breach</li>
                  <li>Take immediate steps to contain and remediate the breach</li>
                  <li>Document the breach and our response for regulatory compliance</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Children's Privacy</h2>
                <p>
                  We take children's privacy seriously. Under the DPDP Act, 2023:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We do not knowingly collect personal data from children under 18 years of age without verifiable parental or guardian consent</li>
                  <li>We do not engage in tracking, behavioral monitoring, or targeted advertising directed at children</li>
                  <li>Any processing of children's data is done only with explicit parental consent and for purposes that are in the best interest of the child</li>
                  <li>Parents/guardians can review, request deletion of, or refuse further collection of their child's data by contacting our Grievance Officer</li>
                </ul>
                <p className="mt-4">
                  If we become aware that we have collected data from a child without appropriate parental consent, we will take immediate steps to delete such information within 72 hours.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Cross-Border Data Transfer</h2>
                <p>
                  Your personal data is primarily stored and processed in India. In limited circumstances, we may transfer data to third parties located outside India (e.g., cloud service providers) only when:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Central Government has approved transfer to that country or territory</li>
                  <li>We have contractual safeguards ensuring equivalent data protection standards</li>
                  <li>You have provided explicit consent for such transfer after being informed of the risks</li>
                </ul>
                <p className="mt-4">
                  We ensure that any cross-border transfer complies with Section 16 of the DPDP Act, 2023 and any rules notified by the Central Government.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">12. Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">13. Updates to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gray-50 rounded-2xl p-8 mt-10 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">14. Grievance Officer / Data Protection Officer</h2>
                <p className="mb-6">
                  In accordance with the Information Technology Act, 2000 and DPDP Act, 2023, we have appointed a Grievance Officer to address your concerns regarding personal data:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#601a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-[#601a29]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Grievance Officer</p>
                      <p className="text-gray-600">{branding.company.name}</p>
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
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-600 whitespace-pre-line">{branding.addresses.primary.full}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-gray-600">
                  <strong>Response Time:</strong> We will acknowledge your grievance within 48 hours and endeavor to resolve it within 30 days.
                </p>
                <div className="mt-6 p-4 bg-[#601a29]/5 rounded-xl border border-[#601a29]/10">
                  <p className="text-gray-700 font-medium">Escalation to Data Protection Board of India</p>
                  <p className="text-gray-600 text-sm mt-2">
                    If you are not satisfied with our response or if your grievance is not resolved within 30 days, you have the right to file a complaint with the Data Protection Board of India as per Section 13 of the DPDP Act, 2023. The Board's contact details will be available on the official government portal once constituted.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="mt-10 text-center"
              >
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href={`mailto:${branding.contact.email}`} className="text-[#601a29] hover:underline font-medium">
                    {branding.contact.email}
                  </a>
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
