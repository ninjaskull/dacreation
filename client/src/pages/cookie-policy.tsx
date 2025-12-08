import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Cookie, Mail, ArrowLeft, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEOHead, getBreadcrumbSchema } from "@/components/seo/SEOHead";
import { useBranding } from "@/contexts/BrandingContext";

export default function CookiePolicyPage() {
  const { branding } = useBranding();
  const lastUpdated = "December 08, 2024";

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        pageType="about"
        title={`Cookie Policy | ${branding.company.name}`}
        description={`Cookie Policy for ${branding.company.name}. Learn about how we use cookies and similar technologies on our website.`}
        canonicalUrl={`${branding.domain.url}/cookie-policy`}
        structuredData={getBreadcrumbSchema(branding, [
          { name: "Home", url: branding.domain.url },
          { name: "Cookie Policy", url: `${branding.domain.url}/cookie-policy` }
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
              <Cookie className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              data-testid="text-page-title"
            >
              Cookie Policy
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
                  This Cookie Policy explains how {branding.company.name} ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website. This policy should be read together with our Privacy Policy.
                </p>
                <p>
                  By using our website, you consent to our use of cookies in accordance with this Cookie Policy and our Privacy Policy. This policy is drafted in compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 of India.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work efficiently, provide a better user experience, and give website owners information about how visitors use their site.
                </p>
                <p>
                  Cookies do not typically contain personal information that directly identifies you, but the information stored in cookies may be linked to your personal data that you provide to us.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies as they are essential for the website to work.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 my-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Cookie Name</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">session_id</td>
                        <td className="py-2">Maintains user session</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">csrf_token</td>
                        <td className="py-2">Security protection</td>
                        <td className="py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences or choices you make on the website (like your language or region).
                </p>
                <div className="bg-gray-50 rounded-xl p-4 my-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Cookie Name</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">user_preferences</td>
                        <td className="py-2">Stores user preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">chat_session</td>
                        <td className="py-2">Live chat functionality</td>
                        <td className="py-2">Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 my-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Cookie Name</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">_ga</td>
                        <td className="py-2">Google Analytics - distinguishes users</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">_gid</td>
                        <td className="py-2">Google Analytics - distinguishes users</td>
                        <td className="py-2">24 hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.4 Marketing Cookies</h3>
                <p>
                  These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 my-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold">Cookie Name</th>
                        <th className="text-left py-2 font-semibold">Purpose</th>
                        <th className="text-left py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2">_fbp</td>
                        <td className="py-2">Facebook Pixel - advertising</td>
                        <td className="py-2">3 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Similar Technologies</h2>
                <p>In addition to cookies, we may use similar technologies such as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Web Beacons:</strong> Small graphic images used to track user behavior and understand how our website is used</li>
                  <li><strong>Local Storage:</strong> Similar to cookies, used to store data on your browser for website functionality</li>
                  <li><strong>Session Storage:</strong> Temporary storage that is deleted when you close your browser</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Third-Party Cookies</h2>
                <p>
                  Some cookies on our website are placed by third-party services. These third parties may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> For website analytics and performance measurement</li>
                  <li><strong>Facebook:</strong> For social media integration and advertising</li>
                  <li><strong>WhatsApp:</strong> For chat functionality integration</li>
                </ul>
                <p className="mt-4">
                  These third parties have their own privacy policies governing the use of their cookies. We encourage you to review their policies.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Managing Cookies</h2>
                <p>
                  You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Browser Settings</h3>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. Here's how to manage cookies in popular browsers:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Chrome:</strong> Settings {">"} Privacy and Security {">"} Cookies</li>
                  <li><strong>Mozilla Firefox:</strong> Options {">"} Privacy & Security {">"} Cookies</li>
                  <li><strong>Safari:</strong> Preferences {">"} Privacy {">"} Cookies</li>
                  <li><strong>Microsoft Edge:</strong> Settings {">"} Privacy, search, and services {">"} Cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Impact of Disabling Cookies</h3>
                <p>
                  Please note that if you disable or reject cookies, some parts of our website may become inaccessible or not function properly. Essential cookies cannot be disabled as they are necessary for the website to work.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Cookie Consent Management</h2>
                <p>
                  Under the DPDP Act, 2023, we are required to obtain your informed consent before placing non-essential cookies on your device.
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 How We Obtain Consent</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>When you first visit our website, a cookie consent banner will be displayed</li>
                  <li>You can choose to accept all cookies, reject non-essential cookies, or customize your preferences</li>
                  <li>Essential cookies are placed automatically as they are necessary for website operation</li>
                  <li>Your consent preferences are stored and remembered for future visits</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 How to Opt Out</h3>
                <p>You can withdraw your cookie consent at any time by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Clearing cookies through your browser settings (this will require you to consent again on your next visit)</li>
                  <li>Adjusting your browser settings to block specific categories of cookies</li>
                  <li>Using third-party opt-out tools for analytics and advertising cookies</li>
                  <li>Contacting us to request removal of your data collected through cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.3 Opt-Out Links for Third-Party Cookies</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> tools.google.com/dlpage/gaoptout</li>
                  <li><strong>Facebook:</strong> facebook.com/ads/preferences</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-[#601a29]/5 rounded-2xl p-6 mt-10 border border-[#601a29]/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#601a29]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-[#601a29]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Consent</h3>
                    <p className="text-gray-700">
                      Under the Digital Personal Data Protection Act, 2023, your consent is required for non-essential cookies. When you first visit our website, you will be presented with a cookie consent banner. By clicking "Accept" or continuing to browse our website, you consent to our use of cookies as described in this policy.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gray-50 rounded-2xl p-8 mt-10 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Contact Us</h2>
                <p className="mb-6">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-10"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Related Policies</h2>
                <p>Please also read our other policies:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>
                    <Link href="/privacy-policy" className="text-[#601a29] hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    {" "}- How we collect and use your personal data
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-[#601a29] hover:underline font-medium">
                      Terms of Service
                    </Link>
                    {" "}- Terms governing the use of our services
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
