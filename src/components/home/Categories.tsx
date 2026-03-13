import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Cpu, Radio, Gauge, Box, Cable, Wrench } from "lucide-react";

const categories = [
  {
    name: "Arduino Boards",
    icon: Cpu,
    count: 10,
    slug: "arduino",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sensors",
    icon: Gauge,
    count: 30,
    slug: "sensors",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "IoT Modules",
    icon: Radio,
    count: 5,
    slug: "iot",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Kits & Bundles",
    icon: Box,
    count: 5,
    slug: "kits",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Cables & Wires",
    icon: Cable,
    count: 15,
    slug: "cables",
    color: "from-yellow-500 to-amber-500",
  },
  {
    name: "Tools",
    icon: Wrench,
    count: 5,
    slug: "tools",
    color: "from-gray-500 to-slate-500",
  },
];

export const Categories = () => {
  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Browse By Category
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Shop Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need from our wide range of electronic components and accessories.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products?category=${category.slug}`}
                className="group block"
              >
                <div className="relative p-6 rounded-2xl bg-card border border-border text-center card-hover overflow-hidden">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} Products
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
