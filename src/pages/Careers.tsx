import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, Heart, Zap, Users, Mail } from "lucide-react";

const values = [
  { icon: Heart, title: "Passion for Making", desc: "We're builders at heart. Everyone here is obsessed with electronics, IoT, and the maker community." },
  { icon: Zap, title: "Move Fast", desc: "We're a small, nimble MSME team. Ideas go from conversation to shipped in days, not months." },
  { icon: Users, title: "Small but Mighty", desc: "No corporate bureaucracy. You'll have real ownership over what you build and direct impact on the business." },
];

const Careers = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Briefcase className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Work With <span className="text-gradient">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We're Ajashia Technologies — a small, MSME-registered tech company from Chennai building cool things for the maker community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* No openings notice */}
      <section className="py-10 border-y border-border">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <p className="text-foreground font-semibold mb-2">No open positions right now</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We're a bootstrapped, growing startup and we're not actively hiring at the moment. But if you're passionate about electronics, e-commerce, or full-stack development and want to be part of something real — we'd love to hear from you anyway.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground text-center mb-8"
          >
            What it's like to work here
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
                  <v.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reach out CTA */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="p-8 rounded-3xl gradient-primary shadow-glow">
            <Mail className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
            <h2 className="text-xl font-bold text-primary-foreground mb-2">Interested anyway?</h2>
            <p className="text-primary-foreground/80 text-sm mb-5">
              Send us a short intro about yourself and what you'd love to work on.
            </p>
            <a href="mailto:ajashiatechnologies@gmail.com?subject=Working with Ajashia Technologies">
              <button className="px-6 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm">
                Send Us a Note
              </button>
            </a>
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </div>
);

export default Careers;