import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, FileQuestion, ChevronDown } from "lucide-react";

const BACKEND_URL = "http://localhost:4000";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    content: "ajashiatechnologies@gmail.com",
    description: "We'll respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    content: "+91 8838614068",
    description: "Mon-Sat 9AM-6PM IST",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    content: "Ajashia Technologies, Chennai-600110",
    description: "By appointment only",
  },
  {
    icon: Clock,
    title: "Business Hours",
    content: "Mon-Sat: 9AM-6PM",
    description: "Sun: 9AM to 2PM",
  },
];

const supportOptions = [
  {
    icon: MessageSquare,
    title: "WhatsApp Support",
    description: "Chat with us directly on WhatsApp",
    action: "Open WhatsApp",
    href: "https://wa.me/918838614068",
  },
  {
    icon: Headphones,
    title: "Phone Support",
    description: "Speak directly with a support specialist",
    action: "Call Now",
    href: "tel:+918838614068",
  },
  {
    icon: FileQuestion,
    title: "Email Support",
    description: "Send us a detailed email query",
    action: "Send Email",
    href: "mailto:ajashiatechnologies@gmail.com",
  },
];

const faqs = [
  {
    question: "Are all products genuine and original?",
    answer: "Yes, 100%. Every component we sell is sourced directly from trusted manufacturers and authorized distributors. We never stock counterfeit parts. ",
  },
  {
    question: "How long does delivery take?",
    answer: "Orders are dispatched within 24 hours (Mon–Sat). Delivery typically takes 3–7 business days across India depending on your location. We ship via reputed couriers and provide tracking details once your order is shipped.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Currently we support online payments via Razorpay (UPI, cards, net banking). COD is not available at this time, but we're working on enabling it soon.",
  },
  {
    question: "Can I return or exchange a product?",
    answer: "Yes. If you receive a damaged or defective product, contact us within 24 hours of delivery with product package unpacking video and your order ID. We'll arrange a replacement or refund.The damage coverage details are mentioned in our policy page on the website.",
  },
  {
    question: "Do you provide technical support for the components?",
    answer: "Absolutely. We offer free technical support via WhatsApp and email for all products purchased from us. Whether it's wiring help, code samples, or troubleshooting — just reach out and we'll help.",
  },
  {
    question: "Can I place a bulk or custom order?",
    answer: "Yes! We welcome bulk orders for institutions, colleges, and businesses. Contact us via email or WhatsApp with your requirements and we'll get back to you with pricing and availability.",
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card or bank details on our servers.",
  },
  {
    question: "Do you ship outside India?",
    answer: "Currently we only ship within India. International shipping is something we're exploring for the future. Stay tuned!",
  },
];

/* ===== FAQ ACCORDION ===== */
const FAQList = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
            openIndex === i ? "border-[#813FF144] bg-[#813FF108]" : "border-border bg-card"
          }`}
        >
          <button
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="font-medium text-foreground text-sm md:text-base">{faq.question}</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                openIndex === i ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

/* ===== MAIN COMPONENT ===== */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="pt-24 pb-16">

        {/* Hero */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Get in <span className="text-gradient">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions about our products or need technical support?
                We're here to help you succeed with your projects.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border text-center card-hover"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                    <info.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                  <p className="text-primary font-medium mb-1">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Support Options */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Support Options + Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">Need Quick Help?</h2>
                <div className="space-y-4">
                  {supportOptions.map((option, index) => (
                    <motion.a
                      key={option.title}
                      href={option.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 card-hover cursor-pointer group block"
                    >
                      <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <option.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <Button variant="outline" size="sm" className="pointer-events-none">
                        {option.action}
                      </Button>
                    </motion.a>
                  ))}
                </div>

                {/* OpenStreetMap embed */}
                <div className="mt-8 rounded-2xl overflow-hidden border border-border h-64">
                  <iframe
                    title="Ajashia Technologies Location"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=80.1883%2C13.0892%2C80.2883%2C13.1692&layer=mapnik&marker=13.1292%2C80.2383"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">FAQ</span>
              <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to the most common questions we get.</p>
            </motion.div>
            <FAQList />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-12 rounded-3xl gradient-primary shadow-glow"
            >
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Still have questions?
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Fill out the contact form above or reach us directly on WhatsApp — we typically respond within a few hours.
              </p>
              <a href="https://wa.me/918838614068" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Chat on WhatsApp
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;