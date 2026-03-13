import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Cpu,
  Target,
  Rocket,
  Heart,
  Award,
  Shield,
  Zap,
  Package,
  Users,
  BadgeCheck,
} from "lucide-react";

/* ================= DATA ================= */

const stats = [
  { value: "300+", label: "Happy Customers", icon: Users },
  { value: "50+", label: "Products Sold", icon: Package },
  { value: "100%", label: "Genuine Parts", icon: BadgeCheck },
  { value: "24/7", label: "Support", icon: Zap },
];

const values = [
  {
    icon: Target,
    title: "Quality First",
    description:
      "We source only genuine components from trusted manufacturers to ensure your projects succeed every time.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    description:
      "Staying ahead with the latest IoT technologies and development boards for modern makers and engineers.",
  },
  {
    icon: Heart,
    title: "Community",
    description:
      "Building a supportive community of makers, hobbyists, and professionals across India.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Committed to exceptional service, fast delivery, and comprehensive technical support.",
  },
];

/* Milestones for the interactive timeline */
const milestones = [
  {
    year: "2020",
    title: "Ajashia Technologies Founded",
    desc: "Started as a technology services company providing embedded systems and IoT consulting under the Ajashia brand.",
    color: "#813FF1",
  },
  {
    year: "2023",
    title: "MSME Registration",
    desc: "Ajashia Technologies officially registered as an MSME, solidifying our commitment to growing India's maker ecosystem.",
    color: "#22c55e",
  },
  {
    year: "2026",
    title: "Ajashia Tech Store Launches",
    desc: "Under the Ajashia Technologies umbrella, we launched the Tech Store — bringing genuine electronics components directly to makers, students and engineers.",
    color: "#f59e0b",
  },
  {
    year: "2026",
    title: "300+ Customers & Growing",
    desc: "Crossed 300 happy customers and 50+ products sold. Every order ships with love from Chennai, Tamil Nadu.",
    color: "#ef4444",
  },
];

/* ================= INTERACTIVE SKILL RADAR ================= */
// Replaces the team section with an interactive "What We're Built On" skill radar —
// a live hover-driven radar chart showing the store's DNA. Unique, memorable, functional.

const skills = [
  { label: "Genuine Parts", value: 98 },
  { label: "Fast Delivery", value: 85 },
  { label: "Tech Support", value: 90 },
  { label: "Competitive Price", value: 88 },
  { label: "Curated Catalog", value: 92 },
  { label: "Trust", value: 95 },
];

const RadarChart = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 200;
  const cy = 200;
  const R = 140;
  const n = skills.length;

  const points = skills.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (s.value / 100) * R;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      lx: cx + (R + 28) * Math.cos(angle),
      ly: cy + (R + 28) * Math.sin(angle),
      ax: cx + R * Math.cos(angle),
      ay: cy + R * Math.sin(angle),
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-sm mx-auto"
        style={{ filter: "drop-shadow(0 0 32px #813FF133)" }}
      >
        {/* Grid rings */}
        {rings.map((r, ri) => {
          const pts = skills
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              return `${cx + R * r * Math.cos(angle)},${cy + R * r * Math.sin(angle)}`;
            })
            .join(" ");
          return (
            <polygon
              key={ri}
              points={pts}
              fill="none"
              stroke="#813FF133"
              strokeWidth="1"
            />
          );
        })}

        {/* Spokes */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.ax}
            y2={p.ay}
            stroke="#813FF144"
            strokeWidth="1"
          />
        ))}

        {/* Filled polygon */}
        <motion.polygon
          points={polygon}
          fill="#813FF122"
          stroke="#813FF1"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Skill dots + labels */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hovered === i ? 8 : 5}
              fill={hovered === i ? "#813FF1" : "#fff"}
              stroke="#813FF1"
              strokeWidth="2"
              style={{ transition: "r 0.2s" }}
            />
            <text
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill={hovered === i ? "#813FF1" : "#94a3b8"}
              fontWeight={hovered === i ? "700" : "400"}
              style={{ transition: "fill 0.2s" }}
            >
              {skills[i].label}
            </text>
            {hovered === i && (
              <text
                x={p.x}
                y={p.y - 16}
                textAnchor="middle"
                fontSize="13"
                fill="#813FF1"
                fontWeight="700"
              >
                {skills[i].value}%
              </text>
            )}
          </g>
        ))}

        {/* Center label */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="13" fill="#813FF1" fontWeight="700">
          Ajashia
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#64748b">
          Tech Store
        </text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-sm">
        {skills.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-default transition-all duration-200 ${
              hovered === i
                ? "border-[#813FF1] bg-[#813FF111]"
                : "border-border bg-muted/20"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: hovered === i ? "#813FF1" : "#64748b" }}
            />
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="ml-auto text-xs font-bold text-foreground">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const About = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="pt-24 pb-16">

        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 hero-gradient" />

          {/* Animated circuit dots background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(18)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#813FF1]"
                style={{
                  left: `${(i * 37 + 5) % 100}%`,
                  top: `${(i * 23 + 10) % 100}%`,
                  opacity: 0.25,
                }}
                animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.8, 1] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <Cpu className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                About{" "}
                <span className="text-gradient">Ajashia Tech Store</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A Chennai-born electronics store built by makers, for makers. We exist to make
                genuine components accessible, affordable, and fast to deliver — across India.
              </p>

              {/* MSME badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-[#813FF144] bg-[#813FF111] text-sm text-[#813FF1] font-medium"
              >
                <Shield className="w-4 h-4" />
                MSME Registered · Under Ajashia Technologies
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-3 shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== OUR STORY ===== */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  Our Story
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                  From a tech company to a{" "}
                  <span className="text-gradient">maker's store</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    It started with <strong className="text-foreground">Ajashia Technologies</strong> — a Chennai-based
                    technology company focused on embedded systems, IoT, and tech consulting.
                    As we worked on projects, we kept running into the same problem: finding
                    genuine, affordable components locally was frustratingly hard.
                  </p>
                  <p>
                    So we built the solution ourselves.{" "}
                    <strong className="text-foreground">Ajashia Tech Store</strong> launched as a natural
                    extension of Ajashia Technologies — bringing the same commitment to
                    quality and engineering we apply to our consulting work, now directly to
                    students, hobbyists, and engineers across India.
                  </p>
                  <p>
                    We're proud to be an{" "}
                    <strong className="text-foreground">MSME-registered business</strong>, growing
                    steadily with 300+ happy customers and counting. Every order ships from
                    Chennai with genuine parts and real care.
                  </p>
                </div>
              </motion.div>

              {/* Interactive milestone timeline */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative pl-6 space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-[#813FF1] via-[#22c55e] to-[#f59e0b]" />

                  {milestones.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="relative group pb-8 last:pb-0"
                    >
                      {/* Dot */}
                      <div
                        className="absolute -left-[23px] w-4 h-4 rounded-full border-2 border-background group-hover:scale-125 transition-transform duration-300"
                        style={{ background: m.color, top: "4px" }}
                      />

                      <div className="bg-card border border-border rounded-xl p-4 group-hover:border-[#813FF144] group-hover:shadow-[0_0_20px_#813FF111] transition-all duration-300">
                        <div
                          className="text-xs font-bold mb-1"
                          style={{ color: m.color }}
                        >
                          {m.year}
                        </div>
                        <div className="font-semibold text-foreground mb-1 text-sm">
                          {m.title}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {m.desc}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== VALUES ===== */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                What drives us
              </span>
              <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do at Ajashia Tech Store.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border text-center card-hover group"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== STORE DNA (replaces team section) ===== */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  Store DNA
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                  What we're{" "}
                  <span className="text-gradient">built on</span>
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Every number on this radar represents a real commitment — not a marketing promise.
                  Hover each skill to see exactly where we stand. We believe in radical transparency
                  about what we're great at and what we're still improving.
                </p>
                <div className="space-y-3">
                  {[
                    "Every component verified before listing",
                    "Orders dispatched within 24 hours",
                    "Free tech support via WhatsApp",
                    "No counterfeit parts — ever",
                  ].map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#813FF122] border border-[#813FF144] flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#813FF1]" />
                      </div>
                      {point}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <RadarChart />
              </motion.div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default About;