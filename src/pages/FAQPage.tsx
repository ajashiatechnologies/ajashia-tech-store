import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    category: "Orders & Payments",
    faqs: [
      { q: "How do I place an order?", a: "Browse our products, add items to your cart, and proceed to checkout. We accept UPI, cards, and net banking via Razorpay. You'll receive an order confirmation email immediately after payment." },
      { q: "Do you offer Cash on Delivery (COD)?", a: "Currently we support online payments only via Razorpay (UPI, cards, net banking). COD is not available at this time but we're working on enabling it soon." },
      { q: "Can I cancel my order?", a: "Orders can be cancelled before they are dispatched. Once dispatched, cancellation is not possible. To cancel, contact us immediately via WhatsApp or email with your order ID." },
      { q: "Is my payment information secure?", a: "Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card or bank details on our servers." },
      { q: "I was charged but didn't receive an order confirmation. What do I do?", a: "This can happen due to a network glitch. Wait 10–15 minutes and check your email (including spam). If no confirmation arrives, contact us with your payment reference number and we'll sort it out." },
    ],
  },
  {
    category: "Shipping & Delivery",
    faqs: [
      { q: "How long does delivery take?", a: "Orders are dispatched within 24 hours (Mon–Sat). Delivery takes 3–7 business days depending on your location across India." },
      { q: "How do I track my order?", a: "Once dispatched, you'll receive a tracking number via email. You can also use our Track Order page on the website." },
      { q: "Do you ship outside India?", a: "Currently we only ship within India. International shipping is on our roadmap." },
      { q: "What are the shipping charges?", a: "Free shipping on orders above ₹499. A flat fee of ₹49 applies for orders below ₹499." },
      { q: "What if my order doesn't arrive?", a: "If your order hasn't arrived within the estimated timeframe, contact us with your order ID and we'll investigate with the courier and resolve it." },
    ],
  },
  {
    category: "Products & Quality",
    faqs: [
      { q: "Are all products genuine and original?", a: "Absolutely. Every component we sell is sourced from trusted manufacturers and authorized distributors. We never stock counterfeit parts." },
      { q: "Do you provide technical support for the components?", a: "Yes — free technical support of 10 mins via WhatsApp and email for all products purchased from us. Whether it's wiring, code samples, or troubleshooting, just reach out." },
      { q: "Can I place a bulk or custom order?", a: "Yes! We welcome bulk orders for institutions, colleges, and businesses. Contact us via email or WhatsApp with your requirements." },
      { q: "Why is a product out of stock?", a: "Stock levels depend on availability from our suppliers. Out-of-stock products can be restocked — contact us and we'll let you know the ETA." },
    ],
  },
  {
    category: "Returns & Refunds",
    faqs: [
      { q: "What is your return policy?", a: "We accept returns for damaged, defective, or wrong items within 24 hours of delivery. Products must be unused and in original packaging." },
      { q: "How do I initiate a return?", a: "Email ajashiatechnologies@gmail.com or WhatsApp +91 8838614068 with your order ID and clear videos of the issue including the unpacking of the product within 24 hours of delivery." },
      { q: "How long does a refund take?", a: "Once approved, refunds are processed within 5–7 business days to your original payment method depending on your bank." },
      { q: "What if I received a wrong product?", a: "We're sorry about that! Contact us within 24 hours with a video of what you received. We'll arrange an immediate replacement at no extra cost." },
    ],
  },
  {
    category: "Account & Profile",
    faqs: [
      { q: "Do I need an account to order?", a: "Currently you need to create an account to place an order, so we can manage your orders, history, and invoices for you." },
      { q: "How do I update my delivery address?", a: "Go to your Profile page and update your address details. Make sure to save before placing a new order." },
      { q: "Can I download my invoice?", a: "Yes! Invoices are automatically generated for every order. You can download them from your Profile page under Order History." },
    ],
  },
];

const FAQPage = () => {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="pt-24 pb-16">

        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <HelpCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about ordering, shipping, returns, and more.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl space-y-12">
            {faqCategories.map((cat, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.05 }}
              >
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 rounded-full bg-primary inline-block" />
                  {cat.category}
                </h2>
                <div className="space-y-2">
                  {cat.faqs.map((faq, fi) => {
                    const key = `${ci}-${fi}`;
                    const open = !!openMap[key];
                    return (
                      <div
                        key={fi}
                        className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
                          open ? "border-[#813FF144] bg-[#813FF108]" : "border-border bg-card"
                        }`}
                      >
                        <button
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                          onClick={() => toggle(key)}
                        >
                          <span className="font-medium text-foreground text-sm">{faq.q}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              key="body"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                            >
                              <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <div className="p-8 rounded-3xl gradient-primary shadow-glow">
              <h2 className="text-xl font-bold text-primary-foreground mb-2">Still have a question?</h2>
              <p className="text-primary-foreground/80 text-sm mb-5">We're happy to help. Reach us on WhatsApp or fill out the contact form.</p>
              <Link to="/contact">
                <button className="px-6 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;