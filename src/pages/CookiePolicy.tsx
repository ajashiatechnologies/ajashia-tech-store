import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cookie } from "lucide-react";

const cookieTypes = [
  {
    type: "Essential Cookies",
    required: true,
    desc: "These cookies are necessary for the website to function. They enable core features like user authentication, session management, and cart functionality. You cannot opt out of these cookies.",
    examples: "Supabase auth session token, user session ID",
  },
  {
    type: "Analytics Cookies",
    required: false,
    desc: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the site.",
    examples: "Page views, referral source, time on page",
  },
  {
    type: "Preference Cookies",
    required: false,
    desc: "These cookies remember choices you make to provide a more personalised experience — such as your preferred language or theme settings.",
    examples: "Theme preference (dark/light mode)",
  },
];

const sections = [
  {
    title: "What Are Cookies?",
    body: `Cookies are small text files that are placed on your device (computer, phone, or tablet) when you visit a website. They help websites remember your preferences and improve your experience over time.\n\nCookies do not contain your personal information directly, but they can store a unique identifier that links to information we hold about you.`,
  },
  {
    title: "How We Use Cookies",
    body: `Ajashia Tech Store uses cookies to:\n\n• Keep you logged in to your account between sessions\n• Remember your cart contents\n• Understand how you navigate our website so we can improve it\n• Remember your preferences (e.g. dark mode)`,
  },
  {
    title: "Third-Party Cookies",
    body: `Some cookies are set by third-party services we use:\n\n• Supabase – authentication and session management\n• Razorpay – payment processing (their cookie policies apply during checkout)\n\nWe do not use advertising or tracking cookies from social media platforms.`,
  },
  {
    title: "How to Control Cookies",
    body: `You can control and delete cookies through your browser settings. Here's how to do it in common browsers:\n\n• Chrome: Settings → Privacy and Security → Cookies\n• Firefox: Settings → Privacy & Security → Cookies\n• Safari: Preferences → Privacy → Manage Website Data\n• Edge: Settings → Cookies and Site Permissions\n\nNote: Disabling essential cookies will prevent you from logging in or using the cart.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Cookie Policy from time to time. The "Last Updated" date at the top of this page will reflect any changes. Continued use of our website after changes constitutes acceptance.`,
  },
  {
    title: "Contact",
    body: `For questions about our use of cookies:\n\nEmail: ajashiatechnologies@gmail.com\nPhone: +91 8838614068`,
  },
];

const CookiePolicy = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Cookie className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Cookie <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: March 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-10">

          {/* Cookie types table */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              {cookieTypes.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{c.type}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                      c.required
                        ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
                        : "text-muted-foreground bg-muted border-border"
                    }`}>
                      {c.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{c.desc}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Examples: </span>{c.examples}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rest of sections */}
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

export default CookiePolicy;