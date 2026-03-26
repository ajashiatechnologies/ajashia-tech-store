import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Newspaper, Download, Mail, Shield } from "lucide-react";
import logo from "../assets/logo.png";

const facts = [
  { label: "Legal Name", value: "Ajashia Technologies" },
  { label: "Trade Name", value: "Ajashia Tech Store" },
  { label: "Type", value: "MSME Registered Business" },
  { label: "Founded", value: "2021" },
  { label: "Location", value: "Chennai, Tamil Nadu, India" },
  { label: "Sector", value: "Electronics E-Commerce / IoT" },
  { label: "Founder", value: "Ajay Kumar D" },
  { label: "Contact for Press", value: "ajashiatechnologies@gmail.com" },
];

const Press = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Newspaper className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Press &amp; <span className="text-gradient">Media</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Resources for journalists, bloggers, and media professionals covering Ajashia Technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company facts */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-8 text-center"
          >
            Company Facts
          </motion.h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            {facts.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between px-6 py-4 ${i < facts.length - 1 ? "border-b border-border" : ""} ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}
              >
                <span className="text-sm text-muted-foreground">{f.label}</span>
                <span className="text-sm font-semibold text-foreground">{f.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand description */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> About Ajashia Technologies
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ajashia Technologies is a Chennai-based, MSME-registered technology company founded in 2021. 
              Under the Ajashia umbrella, we operate Ajashia Tech Store — an online electronics components 
              store serving students, hobbyists, and professionals across India. We specialise in Arduino 
              boards, sensors, IoT modules, cables, and maker kits — all genuine, sourced from trusted 
              manufacturers. Our mission is to make electronics prototyping accessible and affordable for 
              every maker in India.
            </p>
          </div>
        </div>
      </section>

      {/* Logo / brand */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-8 text-center"
          >
            Brand Assets
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { bg: "bg-background border-border", label: "Logo on Dark", textColor: "text-foreground" },
              { bg: "bg-white border-gray-200", label: "Logo on Light", textColor: "text-gray-900" },
            ].map((variant, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-2xl border ${variant.bg} flex flex-col items-center justify-center gap-3`}
              >
                <div className="flex items-center gap-2">
                  <img src={logo} 
              alt="Ajashia"
                className="h-10 w-10 object-contain rounded-xl"/>
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${variant.textColor}`}>Ajashia</span>
                    <span className="text-[10px] text-muted-foreground -mt-1 tracking-wider">TECH STORE</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{variant.label}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Please do not modify our logo or use it in a misleading context. For high-resolution assets, contact us.
          </p>
        </div>
      </section>

      {/* Press contact */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="p-8 rounded-3xl gradient-primary shadow-glow">
            <Mail className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
            <h2 className="text-xl font-bold text-primary-foreground mb-2">Press Enquiries</h2>
            <p className="text-primary-foreground/80 text-sm mb-5">
              For interviews, quotes, or media requests, email us directly.
            </p>
            <a href="mailto:ajashiatechnologies@gmail.com?subject=Press Enquiry">
              <button className="px-6 py-2.5 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm">
                ajashiatechnologies@gmail.com
              </button>
            </a>
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </div>
);

export default Press;