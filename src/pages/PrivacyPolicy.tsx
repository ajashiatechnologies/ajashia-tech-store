import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Who We Are",
    body: `Ajashia Tech Store is operated by Ajashia Technologies, a MSME-registered business located in Chennai, Tamil Nadu, India. When you use our website (ajashiatechstore.com) or purchase from us, you are sharing your information with Ajashia Technologies.\n\nContact: ajashiatechnologies@gmail.com | +91 8838614068`,
  },
  {
    title: "2. What Information We Collect",
    body: `We collect the following categories of personal data:\n\n• Account Information: Name, email address, phone number when you create an account.\n• Delivery Information: Shipping address, city, state, and postal code when you place an order.\n• Payment Information: We do not store any payment card details. Payments are processed by Razorpay, a PCI-DSS compliant gateway. We only receive a payment confirmation reference.\n• Order Information: Products ordered, order amounts, order status, and invoice records.\n• Usage Data: Pages visited, time spent, device type, and browser type (collected anonymously via standard web analytics).`,
  },
  {
    title: "3. How We Use Your Information",
    body: `We use your personal data to:\n\n• Process and fulfil your orders\n• Send order confirmation and invoice emails\n• Provide customer support and respond to enquiries\n• Send shipping tracking information\n• Improve our website and product catalog\n• Comply with legal and tax obligations under Indian law\n\nWe do not use your data for automated decision-making or profiling.`,
  },
  {
    title: "4. Who We Share Your Data With",
    body: `We share your data only with trusted third parties required to deliver our services:\n\n• Razorpay – Payment processing (PCI-DSS certified)\n• Supabase – Secure cloud database hosting\n• Courier Partners – Name, address, and phone number for delivery\n• Google (Gmail/Nodemailer) – Transactional email delivery\n\nWe do not sell, rent, or trade your personal information to any third party for marketing purposes.`,
  },
  {
    title: "5. Data Storage & Security",
    body: `Your data is stored on Supabase servers (hosted on AWS). We implement industry-standard security measures including:\n\n• Encrypted data transmission (HTTPS/TLS)\n• Row-level security policies on our database\n• Access controls limiting who can view customer data\n\nWhile we take all reasonable precautions, no system is 100% secure. Please notify us immediately if you suspect any unauthorised access to your account.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your personal data for as long as your account is active or as required to fulfil our legal obligations. Order records and invoices are retained for a minimum of 7 years as required under Indian tax regulations.\n\nYou may request deletion of your account and associated data at any time by contacting us at ajashiatechnologies@gmail.com. Note that we may retain certain records where required by law.`,
  },
  {
    title: "7. Your Rights",
    body: `Under the Information Technology Act, 2000 and applicable data protection norms, you have the right to:\n\n• Access the personal data we hold about you\n• Correct inaccurate or incomplete data\n• Request deletion of your data (subject to legal obligations)\n• Withdraw consent for optional data processing\n• Lodge a complaint with the relevant authority\n\nTo exercise any of these rights, contact us at ajashiatechnologies@gmail.com.`,
  },
  {
    title: "8. Cookies",
    body: `Our website uses essential cookies required for authentication and session management. We also use analytics cookies to understand how visitors use our site. You can control cookie settings via your browser.\n\nFor full details, please see our Cookie Policy.`,
  },
  {
    title: "9. Children's Privacy",
    body: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us and we will delete it promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. Continued use of our website after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    body: `For any privacy-related questions or requests:\n\nAjashia Technologies\nChennai, Tamil Nadu – 600110, India\nEmail: ajashiatechnologies@gmail.com\nPhone: +91 8838614068`,
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <h2 className="text-lg font-bold text-foreground mb-3">{s.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {s.body}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;