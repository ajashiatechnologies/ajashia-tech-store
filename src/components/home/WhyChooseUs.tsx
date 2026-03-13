import { motion } from "framer-motion";
import { Truck, Shield, BookOpen, CreditCard, Zap, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Free shipping on orders over 499₹ for domestic orders.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "All products are verified. 100% genuine components guaranteed.",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Free tutorials, documentation, and project guides with every purchase.",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Multiple payment options with bank-level encryption and security.",
  },
  {
    icon: Zap,
    title: "Latest Tech",
    description: "Stay ahead with the newest Arduino, Raspberry Pi, and IoT components.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert technical support available around the clock via chat or email.",
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Why Ajashia
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're more than just a store – we're your partner in bringing electronic projects to life.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:bg-card/80 transition-all duration-300 h-full">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow duration-300">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
