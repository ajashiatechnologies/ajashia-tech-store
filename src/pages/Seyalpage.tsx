import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthProvider";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import {
  Zap, Search, ShoppingCart, AlertTriangle, CheckCircle2,
  XCircle, ArrowRight, ChevronDown, ChevronRight, Layers,
  GitBranch, Package, Star, Lock, Network, Cpu, Sparkles,
  BookOpen, Target, Plus, Minus, ExternalLink, Info,
  LayoutGrid, List, Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Types ─────────────────────────────────────────────── */
type Product = { id: string; name: string; price: number; offer_price: number | null; image_url: string; slug: string; stock: number; };
type DnaRelation = { id: string; related_product: Product; relationship_type: "required" | "optional" | "incompatible" | "upgrades"; reason: string; };
type Project = { id: string; name: string; description: string; difficulty: "beginner" | "intermediate" | "advanced" | "expert"; youtube_query: string; components: { product: Product; is_required: boolean; quantity: number }[]; };
type CartItem = { id: string; name: string; price: number; image: string; quantity: number; stock: number; };

const DIFFICULTY_META = {
  beginner:     { label: "Beginner",     color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)",  icon: "🌱" },
  intermediate: { label: "Intermediate", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: "⚡" },
  advanced:     { label: "Advanced",     color: "#813FF1", bg: "rgba(129,63,241,0.12)", border: "rgba(129,63,241,0.25)", icon: "🔬" },
  expert:       { label: "Expert",       color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  icon: "🚀" },
};

const REL_META = {
  required:     { label: "Required",      color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  optional:     { label: "Optional",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",    icon: <Plus className="w-3.5 h-3.5" /> },
  incompatible: { label: "Incompatible",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: <XCircle className="w-3.5 h-3.5" /> },
  upgrades:     { label: "Upgrade Path",  color: "#813FF1", bg: "rgba(129,63,241,0.1)",   icon: <ArrowRight className="w-3.5 h-3.5" /> },
};

/* ─── Animated background circuit lines ─────────────────── */
const CircuitBg = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M0 40 H30 M50 40 H80 M40 0 V30 M40 50 V80" stroke="#813FF1" strokeWidth="1" fill="none"/>
        <circle cx="40" cy="40" r="4" fill="none" stroke="#813FF1" strokeWidth="1"/>
        <circle cx="0"  cy="40" r="2" fill="#813FF1"/>
        <circle cx="80" cy="40" r="2" fill="#813FF1"/>
        <circle cx="40" cy="0"  r="2" fill="#813FF1"/>
        <circle cx="40" cy="80" r="2" fill="#813FF1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit)"/>
  </svg>
);

/* ─── Node Graph Visualizer ──────────────────────────────── */
const NodeGraph = ({ center, relations }: { center: Product; relations: DnaRelation[] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 520, H = 340, CX = W / 2, CY = H / 2, R = 130;

  const nodes = relations.map((rel, i) => {
    const angle = (i / relations.length) * 2 * Math.PI - Math.PI / 2;
    return { ...rel, x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  return (
    <div className="relative w-full overflow-x-auto">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg mx-auto">
        {nodes.map((node, i) => {
          const meta = REL_META[node.relationship_type];
          return (
            <g key={node.id}>
              <motion.line
                x1={CX} y1={CY} x2={node.x} y2={node.y}
                stroke={meta.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              />
              <motion.circle
                cx={node.x} cy={node.y} r="28"
                fill="#0f0f17" stroke={meta.color} strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              />
              <foreignObject x={node.x - 24} y={node.y - 24} width="48" height="48">
                <div className="w-full h-full flex items-center justify-center">
                  <img src={node.related_product.image_url} alt="" className="w-8 h-8 object-cover rounded-full" />
                </div>
              </foreignObject>
              <foreignObject x={node.x - 40} y={node.y + 30} width="80" height="30">
                <div className="text-center" style={{ fontSize: "9px", color: "#94a3b8", lineHeight: 1.2 }}>
                  {node.related_product.name.slice(0, 18)}{node.related_product.name.length > 18 ? "…" : ""}
                </div>
              </foreignObject>
            </g>
          );
        })}
        {/* Center node */}
        <motion.circle cx={CX} cy={CY} r="36" fill="#1a0a2e" stroke="#813FF1" strokeWidth="2"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} />
        <foreignObject x={CX - 28} y={CY - 28} width="56" height="56">
          <div className="w-full h-full flex items-center justify-center">
            <img src={center.image_url} alt="" className="w-10 h-10 object-cover rounded-full" />
          </div>
        </foreignObject>
        <motion.circle cx={CX} cy={CY} r="36" fill="none" stroke="#813FF1" strokeWidth="1" opacity="0.4"
          animate={{ r: [36, 44, 36] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} />
      </svg>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────── */
const SeyalPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { items: cartItems, addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<"explorer" | "bundle" | "health" | "projects">("explorer");
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Explorer state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dnaRelations, setDnaRelations] = useState<DnaRelation[]>([]);
  const [loadingDna, setLoadingDna] = useState(false);
  const [viewMode, setViewMode] = useState<"graph" | "list">("list");
  const [searchOpen, setSearchOpen] = useState(false);

  // Bundle builder state
  const [bundleProduct, setBundleProduct] = useState<Product | null>(null);
  const [bundleSearch, setBundleSearch] = useState("");
  const [bundleResults, setBundleResults] = useState<Product[]>([]);
  const [bundleDna, setBundleDna] = useState<DnaRelation[]>([]);
  const [bundleSelected, setBundleSelected] = useState<Set<string>>(new Set());

  // Health state
  const [healthResult, setHealthResult] = useState<{ missing: DnaRelation[]; conflicts: DnaRelation[]; checked: boolean } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Filter state for projects
  const [diffFilter, setDiffFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    supabase.from("products").select("id,name,price,offer_price,image_url,slug,stock").then(({ data }) => {
      if (data) setProducts(data);
    });
  }, [user]);

  // Search products
  const searchProducts = useCallback((q: string, setter: (r: Product[]) => void) => {
    if (!q.trim()) { setter([]); return; }
    const lower = q.toLowerCase();
    setter(products.filter(p => p.name.toLowerCase().includes(lower)).slice(0, 6));
  }, [products]);

  useEffect(() => { searchProducts(searchQuery, setSearchResults); }, [searchQuery, searchProducts]);
  useEffect(() => { searchProducts(bundleSearch, setBundleResults); }, [bundleSearch, searchProducts]);

  // Fetch DNA for a product
  const fetchDna = async (productId: string, setter: (r: DnaRelation[]) => void, loadSetter: (v: boolean) => void) => {
    loadSetter(true);
    const { data, error } = await supabase
      .from("component_dna")
      .select(`id, relationship_type, reason, sort_order,
        related_product:products!component_dna_related_product_id_fkey(id,name,price,offer_price,image_url,slug,stock)`)
      .eq("product_id", productId)
      .order("sort_order");
    if (!error && data) setter(data as any);
    loadSetter(false);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    fetchDna(product.id, setDnaRelations, setLoadingDna);
  };

  const handleSelectBundle = (product: Product) => {
    setBundleProduct(product);
    setBundleSearch("");
    setBundleResults([]);
    setBundleSelected(new Set());
    fetchDna(product.id, setBundleDna, setLoadingDna);
  };

  // Cart health check
  const runHealthCheck = async () => {
    if (cartItems.length === 0) { toast.error("Your cart is empty"); return; }
    setCheckingHealth(true);
    const missing: DnaRelation[] = [];
    const conflicts: DnaRelation[] = [];
    const cartIds = new Set(cartItems.map((c: CartItem) => c.id));

    for (const item of cartItems) {
      const { data } = await supabase
        .from("component_dna")
        .select(`id, relationship_type, reason,
          related_product:products!component_dna_related_product_id_fkey(id,name,price,offer_price,image_url,slug,stock)`)
        .eq("product_id", item.id)
        .in("relationship_type", ["required", "incompatible"]);

      if (data) {
        data.forEach((rel: any) => {
          if (rel.relationship_type === "required" && !cartIds.has(rel.related_product.id)) missing.push(rel);
          if (rel.relationship_type === "incompatible" && cartIds.has(rel.related_product.id)) conflicts.push(rel);
        });
      }
    }
    setHealthResult({ missing, conflicts, checked: true });
    setCheckingHealth(false);
  };

  // Fetch all projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    const { data: projs } = await supabase.from("product_projects").select("*").order("difficulty");
    if (!projs) { setLoadingProjects(false); return; }

    const enriched = await Promise.all(projs.map(async (proj) => {
      const { data: comps } = await supabase
        .from("project_components")
        .select(`is_required, quantity, product:products(id,name,price,offer_price,image_url,slug,stock)`)
        .eq("project_id", proj.id);
      return { ...proj, components: comps || [] };
    }));
    setProjects(enriched as any);
    setLoadingProjects(false);
  };

  useEffect(() => { if (activeTab === "projects" && projects.length === 0) fetchProjects(); }, [activeTab]);

  const addBundleToCart = () => {
    const toAdd = bundleDna.filter(r => bundleSelected.has(r.id) && r.relationship_type !== "incompatible");
    if (bundleProduct) addToCart({ id: bundleProduct.id, name: bundleProduct.name, price: bundleProduct.offer_price ?? bundleProduct.price, image: bundleProduct.image_url, stock: bundleProduct.stock });
    toAdd.forEach(r => addToCart({ id: r.related_product.id, name: r.related_product.name, price: r.related_product.offer_price ?? r.related_product.price, image: r.related_product.image_url, stock: r.related_product.stock }));
    toast.success(`Added ${toAdd.length + 1} items to cart!`);
    setBundleSelected(new Set());
  };

  const price = (p: Product) => p.offer_price ?? p.price;

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center dark relative overflow-hidden">
        <CircuitBg />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center relative z-10 max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#813FF1] to-[#5B21B6] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Seyal</h1>
          <p className="text-white/50 mb-6 leading-relaxed">Component DNA intelligence. Understand what works with what. Build smarter.</p>
          <div className="flex items-center gap-2 justify-center text-white/30 text-sm mb-8">
            <Lock className="w-4 h-4" /> Sign in required
          </div>
          <Button onClick={() => navigate("/auth/sign-in")} className="gradient-primary text-white px-8">
            Sign In to Access Seyal
          </Button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: "explorer", label: "DNA Explorer", icon: <Network className="w-4 h-4" /> },
    { id: "bundle",   label: "Bundle Builder", icon: <Layers className="w-4 h-4" /> },
    { id: "health",   label: "Cart Health", icon: <ShoppingCart className="w-4 h-4" />, badge: cartItems.length },
    { id: "projects", label: "Projects", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const filteredProjects = diffFilter === "all" ? projects : projects.filter(p => p.difficulty === diffFilter);

  return (
    <div className="min-h-screen bg-[#0B0B0F] dark relative overflow-hidden">
      <CircuitBg />

      {/* Hero */}
      <div className="relative pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Component Intelligence System
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
             செயல் <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#813FF1] to-[#a855f7]">Seyal</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-xl mx-auto">
            Know what works with what. Build bundles. Catch conflicts. Discover projects.
          </motion.p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-[#0B0B0F]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all relative ${
                  activeTab === tab.id ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}>
                {tab.icon} {tab.label}
                {tab.badge ? <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center">{tab.badge}</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">

          {/* ─── DNA EXPLORER ───────────────────────────── */}
          {activeTab === "explorer" && (
            <motion.div key="explorer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Component DNA Explorer</h2>
                <p className="text-white/40 text-sm">Search any product to see its full dependency map — what it needs, what enhances it, and what conflicts.</p>
              </div>

              {/* Search */}
              <div className="relative max-w-lg mb-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search a product to explore its DNA…"
                  className="w-full bg-[#111118] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <AnimatePresence>
                  {searchOpen && searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#111118] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                      {searchResults.map(p => (
                        <button key={p.id} onClick={() => handleSelectProduct(p)}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left">
                          <img src={p.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm text-white font-medium">{p.name}</p>
                            <p className="text-xs text-white/40">₹{price(p)}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DNA Result */}
              {selectedProduct && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Product header */}
                  <div className="flex items-center gap-4 p-5 bg-[#111118] border border-purple-500/20 rounded-2xl mb-6">
                    <img src={selectedProduct.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-xs text-purple-400 font-medium mb-1">Exploring DNA for</p>
                      <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
                      <p className="text-sm text-white/40">₹{price(selectedProduct)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg border transition-colors ${viewMode === "list" ? "border-purple-500/50 bg-purple-500/10 text-purple-300" : "border-white/10 text-white/40"}`}>
                        <List className="w-4 h-4" />
                      </button>
                      <button onClick={() => setViewMode("graph")} className={`p-2 rounded-lg border transition-colors ${viewMode === "graph" ? "border-purple-500/50 bg-purple-500/10 text-purple-300" : "border-white/10 text-white/40"}`}>
                        <GitBranch className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {loadingDna ? (
                    <div className="text-center py-12 text-white/30">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Cpu className="w-8 h-8 mx-auto mb-3" />
                      </motion.div>
                      Scanning component DNA…
                    </div>
                  ) : dnaRelations.length === 0 ? (
                    <div className="text-center py-12 bg-[#111118] rounded-2xl border border-white/5 text-white/30">
                      <Network className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No DNA relationships mapped yet for this component.
                    </div>
                  ) : viewMode === "graph" ? (
                    <div className="bg-[#111118] border border-white/10 rounded-2xl p-6">
                      <NodeGraph center={selectedProduct} relations={dnaRelations} />
                      <div className="flex flex-wrap gap-3 justify-center mt-4">
                        {Object.entries(REL_META).map(([key, meta]) => (
                          <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: meta.color }}>
                            {meta.icon} {meta.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(["required", "optional", "upgrades", "incompatible"] as const).map(type => {
                        const rels = dnaRelations.filter(r => r.relationship_type === type);
                        if (!rels.length) return null;
                        const meta = REL_META[type];
                        return (
                          <div key={type} className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5" style={{ background: meta.bg }}>
                              <span style={{ color: meta.color }}>{meta.icon}</span>
                              <span className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                              <span className="ml-auto text-xs text-white/30">{rels.length} component{rels.length !== 1 ? "s" : ""}</span>
                            </div>
                            {rels.map(rel => (
                              <div key={rel.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                                <img src={rel.related_product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                  <Link to={`/product/${rel.related_product.slug}`} className="text-sm font-medium text-white hover:text-purple-300 transition-colors">
                                    {rel.related_product.name}
                                  </Link>
                                  {rel.reason && <p className="text-xs text-white/40 mt-0.5 truncate">{rel.reason}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold text-white">₹{price(rel.related_product)}</p>
                                  <button onClick={() => { addToCart({ id: rel.related_product.id, name: rel.related_product.name, price: price(rel.related_product), image: rel.related_product.image_url, stock: rel.related_product.stock }); toast.success("Added to cart"); }}
                                    disabled={rel.relationship_type === "incompatible"}
                                    className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-30 disabled:cursor-not-allowed mt-1">
                                    + Add to cart
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {!selectedProduct && (
                <div className="text-center py-20 text-white/20">
                  <Network className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Search a product above to explore its Component DNA</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── BUNDLE BUILDER ─────────────────────────── */}
          {activeTab === "bundle" && (
            <motion.div key="bundle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Bundle Builder</h2>
                <p className="text-white/40 text-sm">Pick a base component. Select what you need. Add everything to cart in one click.</p>
              </div>

              {/* Search */}
              <div className="relative max-w-lg mb-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={bundleSearch} onChange={e => setBundleSearch(e.target.value)}
                  placeholder="Pick your base component…"
                  className="w-full bg-[#111118] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/50 transition-colors" />
                <AnimatePresence>
                  {bundleResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#111118] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                      {bundleResults.map(p => (
                        <button key={p.id} onClick={() => handleSelectBundle(p)}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left">
                          <img src={p.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          <div><p className="text-sm text-white font-medium">{p.name}</p><p className="text-xs text-white/40">₹{price(p)}</p></div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {bundleProduct && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-4 p-5 bg-[#111118] border border-purple-500/20 rounded-2xl mb-4">
                    <img src={bundleProduct.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs text-purple-400 mb-1">Base component</p>
                      <h3 className="font-bold text-white">{bundleProduct.name}</h3>
                      <p className="text-sm text-white/40">₹{price(bundleProduct)}</p>
                    </div>
                  </div>

                  {bundleDna.length === 0 ? (
                    <div className="text-center py-10 text-white/30 bg-[#111118] rounded-2xl border border-white/5">No related components found for this product yet.</div>
                  ) : (
                    <>
                      <p className="text-sm text-white/40 mb-4">Select components to bundle:</p>
                      <div className="space-y-2 mb-6">
                        {bundleDna.filter(r => r.relationship_type !== "incompatible").map(rel => {
                          const checked = bundleSelected.has(rel.id);
                          const meta = REL_META[rel.relationship_type];
                          return (
                            <motion.div key={rel.id} whileTap={{ scale: 0.98 }}
                              onClick={() => setBundleSelected(prev => { const s = new Set(prev); checked ? s.delete(rel.id) : s.add(rel.id); return s; })}
                              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${checked ? "bg-purple-500/10 border-purple-500/30" : "bg-[#111118] border-white/5 hover:border-white/15"}`}>
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-purple-500 border-purple-500" : "border-white/20"}`}>
                                {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <img src={rel.related_product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{rel.related_product.name}</p>
                                {rel.reason && <p className="text-xs text-white/40 truncate">{rel.reason}</p>}
                                <span className="inline-flex items-center gap-1 text-[10px] mt-1 px-2 py-0.5 rounded-full" style={{ color: meta.color, background: meta.bg }}>
                                  {meta.icon} {meta.label}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-white shrink-0">₹{price(rel.related_product)}</p>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Bundle total */}
                      {bundleSelected.size > 0 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="sticky bottom-6 bg-[#1a0a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-2xl shadow-purple-900/40">
                          <div>
                            <p className="text-xs text-white/50">{bundleSelected.size + 1} items selected</p>
                            <p className="text-lg font-bold text-white">
                              ₹{(price(bundleProduct) + bundleDna.filter(r => bundleSelected.has(r.id)).reduce((s, r) => s + price(r.related_product), 0)).toFixed(2)}
                            </p>
                          </div>
                          <Button onClick={addBundleToCart} className="ml-auto gradient-primary text-white gap-2">
                            <ShoppingCart className="w-4 h-4" /> Add Bundle to Cart
                          </Button>
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {!bundleProduct && (
                <div className="text-center py-20 text-white/20">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Pick a base component to start building your bundle</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── CART HEALTH ────────────────────────────── */}
          {activeTab === "health" && (
            <motion.div key="health" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Cart Health Check</h2>
                <p className="text-white/40 text-sm">Scan your current cart for missing required components and incompatible pairs.</p>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-[#111118] rounded-2xl border border-white/5">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/30">Your cart is empty. Add some products first.</p>
                  <Link to="/products"><Button variant="outline" className="mt-4">Browse Products</Button></Link>
                </div>
              ) : (
                <>
                  {/* Cart summary */}
                  <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 mb-6">
                    <p className="text-sm text-white/50 mb-3">{cartItems.length} items in your cart:</p>
                    <div className="flex flex-wrap gap-2">
                      {cartItems.map((item: CartItem) => (
                        <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                          <img src={item.image} alt="" className="w-6 h-6 rounded object-cover" />
                          <span className="text-xs text-white/70">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={runHealthCheck} disabled={checkingHealth} className="gradient-primary text-white gap-2 mb-8">
                    {checkingHealth ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Cpu className="w-4 h-4" /></motion.div> Scanning…</>
                    ) : (
                      <><Target className="w-4 h-4" /> Run Health Check</>
                    )}
                  </Button>

                  <AnimatePresence>
                    {healthResult?.checked && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {healthResult.missing.length === 0 && healthResult.conflicts.length === 0 ? (
                          <div className="flex items-center gap-3 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-green-400">Cart looks great!</p>
                              <p className="text-sm text-white/50 mt-0.5">No missing dependencies or conflicts detected.</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {healthResult.missing.length > 0 && (
                              <div className="bg-[#111118] border border-red-500/20 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border-b border-red-500/20">
                                  <AlertTriangle className="w-4 h-4 text-red-400" />
                                  <span className="text-sm font-semibold text-red-400">Missing Required Components ({healthResult.missing.length})</span>
                                </div>
                                {healthResult.missing.map(rel => (
                                  <div key={rel.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
                                    <img src={rel.related_product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-white">{rel.related_product.name}</p>
                                      {rel.reason && <p className="text-xs text-white/40 mt-0.5">{rel.reason}</p>}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-white">₹{price(rel.related_product)}</p>
                                      <button onClick={() => { addToCart({ id: rel.related_product.id, name: rel.related_product.name, price: price(rel.related_product), image: rel.related_product.image_url, stock: rel.related_product.stock }); toast.success("Added to cart"); }}
                                        className="text-xs text-purple-400 hover:text-purple-300 mt-1">+ Add to cart</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {healthResult.conflicts.length > 0 && (
                              <div className="bg-[#111118] border border-yellow-500/20 rounded-2xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
                                  <XCircle className="w-4 h-4 text-yellow-400" />
                                  <span className="text-sm font-semibold text-yellow-400">Incompatible Pairs ({healthResult.conflicts.length})</span>
                                </div>
                                {healthResult.conflicts.map(rel => (
                                  <div key={rel.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
                                    <img src={rel.related_product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-white">{rel.related_product.name}</p>
                                      {rel.reason && <p className="text-xs text-white/40 mt-0.5">{rel.reason}</p>}
                                    </div>
                                    <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg">Conflict</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ─── PROJECTS ───────────────────────────────── */}
          {activeTab === "projects" && (
            <motion.div key="projects" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Project Explorer</h2>
                  <p className="text-white/40 text-sm">Browse projects by difficulty. See exactly what parts you need.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "beginner", "intermediate", "advanced", "expert"].map(d => {
                    const meta = d !== "all" ? DIFFICULTY_META[d as keyof typeof DIFFICULTY_META] : null;
                    return (
                      <button key={d} onClick={() => setDiffFilter(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                          diffFilter === d
                            ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                            : "border-white/10 text-white/40 hover:text-white"
                        }`}>
                        {meta ? `${meta.icon} ${meta.label}` : "All"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {loadingProjects ? (
                <div className="text-center py-16 text-white/30">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block mb-3">
                    <Cpu className="w-8 h-8" />
                  </motion.div>
                  <p>Loading projects…</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16 bg-[#111118] rounded-2xl border border-white/5 text-white/30">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No projects found. Add some via the Admin DNA Manager.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredProjects.map((project, i) => {
                    const meta = DIFFICULTY_META[project.difficulty];
                    const totalCost = project.components.reduce((s, c) => s + (c.product.offer_price ?? c.product.price) * c.quantity, 0);
                    return (
                      <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/20 transition-colors group">
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">{project.name}</h3>
                            <span className="text-lg ml-2 shrink-0">{meta.icon}</span>
                          </div>
                          {project.description && <p className="text-sm text-white/50 mb-4 leading-relaxed">{project.description}</p>}

                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium mb-4"
                            style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                            {meta.label}
                          </span>

                          {/* Components needed */}
                          <div className="space-y-2 mb-4">
                            <p className="text-xs text-white/30 font-medium uppercase tracking-wider">Components Needed</p>
                            {project.components.slice(0, 4).map(comp => (
                              <div key={comp.product.id} className="flex items-center gap-2">
                                <img src={comp.product.image_url} alt="" className="w-7 h-7 rounded object-cover" />
                                <span className="text-xs text-white/60 flex-1 truncate">{comp.product.name}</span>
                                {!comp.is_required && <span className="text-[10px] text-white/30">optional</span>}
                                <span className="text-xs text-white/40">×{comp.quantity}</span>
                              </div>
                            ))}
                            {project.components.length > 4 && (
                              <p className="text-xs text-white/30">+{project.components.length - 4} more components</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div>
                              <p className="text-xs text-white/30">Est. cost</p>
                              <p className="text-sm font-bold text-white">₹{totalCost.toFixed(0)}</p>
                            </div>
                            <div className="flex gap-2">
                              {project.youtube_query && (
                                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(project.youtube_query)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
                                  <Youtube className="w-3.5 h-3.5" /> Watch
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  project.components.filter(c => c.is_required).forEach(c => addToCart({ id: c.product.id, name: c.product.name, price: c.product.offer_price ?? c.product.price, image: c.product.image_url, stock: c.product.stock }));
                                  toast.success(`Added ${project.components.filter(c => c.is_required).length} required parts to cart!`);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/20 transition-colors">
                                <ShoppingCart className="w-3.5 h-3.5" /> Add parts
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default SeyalPage;