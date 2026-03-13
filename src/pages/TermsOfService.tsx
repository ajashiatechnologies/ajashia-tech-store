import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using the Ajashia Tech Store website and placing orders, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.\n\nThese terms are governed by the laws of India, including the Information Technology Act, 2000 and the Consumer Protection Act, 2019.`,
  },
  {
    title: "2. About Us",
    body: `Ajashia Tech Store is operated by Ajashia Technologies, a MSME-registered business based in Chennai, Tamil Nadu, India.\n\nContact: ajashiatechnologies@gmail.com | +91 8838614068`,
  },
  {
    title: "3. Products & Pricing",
    body: `• All product prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.\n• We reserve the right to change prices without prior notice. The price at the time of order placement is the price you pay.\n• Product images are for illustration purposes. Actual products may vary slightly from images shown.\n• We make every effort to ensure product descriptions and specifications are accurate. In case of error, we will contact you before dispatching.`,
  },
  {
    title: "4. Orders & Payment",
    body: `• Orders are accepted subject to product availability and successful payment.\n• Payment is processed securely by Razorpay. We accept UPI, credit/debit cards, and net banking.\n• We do not store any payment card information on our servers.\n• An order is confirmed only after payment is successfully received and you receive a confirmation email.\n• We reserve the right to cancel any order at our discretion (e.g. pricing error, stock discrepancy). In such cases, a full refund will be issued.`,
  },
  {
    title: "5. Shipping & Delivery",
    body: `• We ship within India only. We do not currently offer international shipping.\n• Delivery timelines are estimates and not guaranteed. We are not liable for delays caused by courier services, weather, or other factors outside our control.\n• Risk of loss transfers to you upon delivery. Please inspect your package upon receipt.\n• For detailed shipping information, see our Shipping Policy.`,
  },
  {
    title: "6. Returns & Refunds",
    body: `• We accept returns for damaged, defective, or incorrectly shipped items within 24 hours of delivery.\n• Refunds are processed to the original payment method within 5–7 business days after approval.\n• For complete details, see our Returns & Refunds Policy.`,
  },
  {
    title: "7. User Accounts",
    body: `• You are responsible for maintaining the confidentiality of your account credentials.\n• You agree to provide accurate and complete information when creating your account.\n• We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.\n• You must be 18 years or older to create an account and place orders. If you are under 18, you may use our website only with involvement of a parent or guardian who agrees to be responsible for your actions.`,
  },
  {
    title: "8. Intellectual Property",
    body: `All content on this website — including text, images, logos, product descriptions, and code — is the property of Ajashia Technologies and is protected under applicable intellectual property laws. You may not reproduce, distribute, or use our content without prior written permission.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, Ajashia Technologies shall not be liable for:\n\n• Any indirect, incidental, or consequential damages arising from your use of our products or website\n• Any damage to your projects, devices, or property caused by use of components purchased from us\n• Any loss of data or business interruption\n\nOur total liability to you for any claim shall not exceed the amount you paid for the specific product giving rise to the claim.`,
  },
  {
    title: "10. Disclaimer of Warranties",
    body: `Products are provided "as is." While we source only genuine components from trusted suppliers, we do not warrant that every product will be suitable for your specific application. It is your responsibility to verify component specifications before use in safety-critical applications.`,
  },
  {
    title: "11. Governing Law & Disputes",
    body: `These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.\n\nWe encourage you to contact us first to resolve any dispute amicably before pursuing legal action.`,
  },
  {
    title: "12. Changes to Terms",
    body: `We reserve the right to update these Terms at any time. Changes will be posted on this page with an updated date. Continued use of our services after changes are posted constitutes your acceptance of the new Terms.`,
  },
  {
    title: "13. Contact",
    body: `For any questions about these Terms:\n\nAjashia Technologies\nChennai, Tamil Nadu – 600110, India\nEmail: ajashiatechnologies@gmail.com\nPhone: +91 8838614068`,
  },
];

const TermsOfService = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Terms of <span className="text-gradient">Service</span>
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

export default TermsOfService;