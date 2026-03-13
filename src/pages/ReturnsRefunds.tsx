import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const eligible = [
  "Product received in physically damaged condition",
  "Wrong item shipped (different from what was ordered)",
  "Item is dead-on-arrival (DOA) — not functional out of the box (Code Upload Issues are not covered under DOA in any of the boards)",
  "Missing items or accessories from the order, only covers if it's mentioned in the packing slip as included in the box",
];

const notEligible = [
  "Products damaged due to improper use or electrical mishandling",
  "Items returned without original packaging",
  "Returns requested after 24 hours of delivery",
  "Products that have been soldered, modified, or altered",
  "Change of mind after purchase",
];

const steps = [
  { step: "01", title: "Contact Us Within 24 Hours", desc: "Email ajashiatechnologies@gmail.com or WhatsApp +91 8838614068 with your order ID and clear videos of the issue including the unpacking of the product." },
  { step: "02", title: "We Review Your Request", desc: "Our team reviews your request within 24 hours and confirms eligibility for a return or replacement." },
  { step: "03", title: "Ship It Back (if required)", desc: "For returns, we'll provide instructions for shipping the product back. Return shipping is covered by us if the fault is on our end." },
  { step: "04", title: "Replacement or Refund", desc: "Once received and verified, we dispatch a replacement within 2 business days or process your refund within 5–7 business days to your original payment method." },
];

const ReturnsRefunds = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <RefreshCw className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Returns &amp; <span className="text-gradient">Refunds</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We stand behind every product we sell. If something's wrong, we'll make it right.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 48-hour notice */}
      <section className="py-10 border-y border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#813FF111] border border-[#813FF133] text-center justify-center">
            <Clock className="w-6 h-6 text-primary shrink-0" />
            <p className="text-foreground font-medium">
              All return/replacement requests must be raised within <span className="text-primary font-bold">24 hours</span> of delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Eligible / Not Eligible */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Eligible for Return / Replacement
              </h2>
              <ul className="space-y-3">
                {eligible.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" /> Not Eligible for Return
              </h2>
              <ul className="space-y-3">
                {notEligible.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-10 text-center"
          >
            Return Process
          </motion.h2>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 p-5 rounded-2xl bg-card border border-border"
              >
                <div className="text-3xl font-black text-[#813FF133] shrink-0 w-10">{s.step}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground text-center mb-8"
          >
            Refund Timeline
          </motion.h2>
          {[
            { method: "UPI / Net Banking", timeline: "3–5 business days" },
            { method: "Credit / Debit Card", timeline: "5–7 business days" },
            { method: "Razorpay Wallet", timeline: "1–2 business days" },
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-5 rounded-xl bg-card border border-border"
            >
              <span className="font-medium text-foreground">{row.method}</span>
              <span className="text-primary font-semibold text-sm">{row.timeline}</span>
            </motion.div>
          ))}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Refund timelines depend on your bank or payment provider and are outside our control once initiated. If you haven't received your refund after the stated period, contact your bank first, then reach out to us.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="p-8 rounded-3xl gradient-primary shadow-glow">
            <Mail className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
            <h2 className="text-xl font-bold text-primary-foreground mb-2">Need to raise a return?</h2>
            <p className="text-primary-foreground/80 text-sm mb-5">Email us with your order ID and photos within 48 hours of delivery.</p>
            <Link to="/contact">
              <Button className="bg-white text-primary hover:bg-white/90">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </div>
);

export default ReturnsRefunds;