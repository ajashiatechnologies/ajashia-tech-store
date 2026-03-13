import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Truck, Clock, MapPin, Package, AlertCircle, CheckCircle } from "lucide-react";

const shippingZones = [
  { zone: "Metro Cities", cities: "Chennai, Mumbai, Delhi, Bengaluru, Hyderabad, Pune", days: "2–4 Business Days" },
  { zone: "Tier 2 Cities", cities: "Coimbatore, Madurai, Jaipur, Lucknow, Nagpur, Surat", days: "3–5 Business Days" },
  { zone: "Other Cities & Towns", cities: "All other serviceable pin codes across India", days: "5–7 Business Days" },
  { zone: "Remote Areas", cities: "Certain hilly/remote regions", days: "7–10 Business Days" },
];

const steps = [
  { icon: CheckCircle, title: "Order Placed", desc: "You place your order and payment is confirmed." },
  { icon: Package, title: "Packed & Dispatched", desc: "Your order is carefully packed and handed to our courier partner within 24 hours (Mon–Sat)." },
  { icon: Truck, title: "In Transit", desc: "Your package is on its way. You'll receive a tracking number via email." },
  { icon: MapPin, title: "Delivered", desc: "Package delivered to your doorstep. Please inspect before signing." },
];

const ShippingInfo = () => (
  <div className="min-h-screen bg-background dark">
    <Header />
    <main className="pt-24 pb-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
              <Truck className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Shipping <span className="text-gradient">Information</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We ship across India. Here's everything you need to know about how we get your order to you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key highlights */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Clock, title: "Dispatched in 24 Hours", desc: "All orders placed Mon–Sat are dispatched the next business day." },
              { icon: MapPin, title: "Pan-India Delivery", desc: "We deliver to all serviceable pin codes across India." },
              { icon: Package, title: "Secure Packaging", desc: "Every order is bubble-wrapped and packed properly for safe transit." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-3 shadow-glow">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-8 text-center"
          >
            How Your Order Gets to You
          </motion.h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 pl-14 relative"
                >
                  <div className="absolute left-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                    <step.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery zones */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-foreground mb-8 text-center"
          >
            Estimated Delivery Times
          </motion.h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Zone</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Covers</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Estimated Time</th>
                </tr>
              </thead>
              <tbody>
                {shippingZones.map((zone, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{zone.zone}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{zone.cities}</td>
                    <td className="px-6 py-4 text-sm text-primary font-medium">{zone.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            * Delivery times are estimates and may vary during peak seasons or public holidays.
          </p>
        </div>
      </section>

      {/* Policies */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          {[
            { title: "Shipping Charges", body: "We currently offer free shipping on all orders above ₹499. Orders below ₹499 attract a flat shipping fee of ₹49." },
            { title: "Order Tracking", body: "Once your order is dispatched, you will receive a tracking number via email. You can use this to track your shipment on the courier's website. You can also check your order status from your profile page on our website." },
            { title: "Orders Placed on Sundays / Holidays", body: "Orders placed on Sundays or public holidays will be processed on the next working day. Sunday orders are still accepted and queued for Monday dispatch." },
            { title: "Incorrect Address", body: "Please ensure your delivery address and pin code are correct before placing an order. We are not responsible for delays or non-delivery caused by incorrect address details provided by the customer." },
            { title: "Damaged in Transit", body: "In the rare case your order arrives damaged, please take videos of unpacking the package immediately and contact us within 24 hours at ajashiatechnologies@gmail.com or WhatsApp +91 8838614068. We will arrange a replacement or refund." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </motion.div>
          ))}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Currently shipping within India only.</span> International shipping is on our roadmap and will be announced soon.
            </p>
          </div>
        </div>
      </section>

    </main>
    <Footer />
  </div>
);

export default ShippingInfo;