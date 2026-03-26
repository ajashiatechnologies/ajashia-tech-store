import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Network, Layers, ShoppingCart, BookOpen, ArrowRight } from "lucide-react";

const features = [
  { icon: Network, label: "DNA Explorer", desc: "See what every component needs" },
  { icon: Layers,  label: "Bundle Builder", desc: "Build complete kits in one click" },
  { icon: ShoppingCart, label: "Cart Health", desc: "Catch missing parts before checkout" },
  { icon: BookOpen, label: "Project Ideas", desc: "Discover what you can build" },
];

const SeyalBanner = () => (
  <section className="py-16 px-4 relative overflow-hidden">
    {/* Circuit background */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="seyal-circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 40 H30 M50 40 H80 M40 0 V30 M40 50 V80" stroke="#813FF1" strokeWidth="1" fill="none"/>
          <circle cx="40" cy="40" r="4" fill="none" stroke="#813FF1" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#seyal-circuit)"/>
    </svg>

    <div className="max-w-5xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-violet-500/5 p-8 md:p-12"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Left content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium mb-4">
              <Zap className="w-3 h-3" /> Exclusive Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              செயல் <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Seyal</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-6 max-w-md">
              India's intuitive Component DNA system. Know exactly what works with what, catch missing parts before checkout, and discover projects you can build right now.
            </p>
            <Link to="/seyal">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
              >
                Explore Seyal <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Right features grid */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[320px]">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
              >
                <f.icon className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default SeyalBanner;