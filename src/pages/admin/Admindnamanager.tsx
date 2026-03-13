import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Network, Plus, Trash2, Search, ChevronDown,
  Zap, BookOpen, Tag, X, Youtube, Package,
  AlertTriangle, CheckCircle2, ArrowRight, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Product = { id: string; name: string; image_url: string; price: number; };
type DnaRow  = { id: string; related_product: Product; relationship_type: string; reason: string; sort_order: number; };
type Project = { id: string; name: string; description: string; difficulty: string; youtube_query: string;
  components: { id: string; product: Product; is_required: boolean; quantity: number }[]; };

const REL_TYPES = [
  { value: "required",     label: "Required",     color: "#ef4444", desc: "Cannot function without this" },
  { value: "optional",     label: "Optional",     color: "#22c55e", desc: "Enhances functionality" },
  { value: "incompatible", label: "Incompatible", color: "#f59e0b", desc: "Do not use together" },
  { value: "upgrades",     label: "Upgrades",     color: "#813FF1", desc: "Better alternative" },
];
const DIFFICULTIES = ["beginner","intermediate","advanced","expert"];
const DIFF_COLORS: Record<string,string> = { beginner:"#22c55e", intermediate:"#f59e0b", advanced:"#813FF1", expert:"#ef4444" };

const AdminDNAManager = () => {
  const [tab, setTab] = useState<"dna"|"projects">("dna");
  const [products, setProducts] = useState<Product[]>([]);

  // DNA state
  const [dnaSearch, setDnaSearch] = useState("");
  const [dnaResults, setDnaResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dnaRows, setDnaRows] = useState<DnaRow[]>([]);
  const [loadingDna, setLoadingDna] = useState(false);

  // Add DNA form
  const [relSearch, setRelSearch] = useState("");
  const [relResults, setRelResults] = useState<Product[]>([]);
  const [relProduct, setRelProduct] = useState<Product | null>(null);
  const [relType, setRelType] = useState("required");
  const [relReason, setRelReason] = useState("");
  const [savingDna, setSavingDna] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projForm, setProjForm] = useState({ name:"", description:"", difficulty:"beginner", youtube_query:"" });
  const [savingProject, setSavingProject] = useState(false);

  // Project component add
  const [expandedProject, setExpandedProject] = useState<string|null>(null);
  const [compSearch, setCompSearch] = useState("");
  const [compResults, setCompResults] = useState<Product[]>([]);
  const [compProduct, setCompProduct] = useState<Product|null>(null);
  const [compRequired, setCompRequired] = useState(true);
  const [compQty, setCompQty] = useState(1);
  const [savingComp, setSavingComp] = useState(false);

  useEffect(() => {
    supabase.from("products").select("id,name,image_url,price").then(({ data }) => { if (data) setProducts(data); });
  }, []);

  const searchProds = useCallback((q: string, setter: (r: Product[]) => void) => {
    if (!q.trim()) { setter([]); return; }
    const lower = q.toLowerCase();
    setter(products.filter(p => p.name.toLowerCase().includes(lower)).slice(0, 6));
  }, [products]);

  useEffect(() => { searchProds(dnaSearch, setDnaResults); }, [dnaSearch, searchProds]);
  useEffect(() => { searchProds(relSearch, setRelResults); }, [relSearch, searchProds]);
  useEffect(() => { searchProds(compSearch, setCompResults); }, [compSearch, searchProds]);

  const fetchDna = async (productId: string) => {
    setLoadingDna(true);
    const { data } = await supabase.from("component_dna")
      .select(`id, relationship_type, reason, sort_order, related_product:products!component_dna_related_product_id_fkey(id,name,image_url,price)`)
      .eq("product_id", productId).order("sort_order");
    if (data) setDnaRows(data as any);
    setLoadingDna(false);
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    const { data: projs } = await supabase.from("product_projects").select("*").order("created_at", { ascending: false });
    if (!projs) { setLoadingProjects(false); return; }
    const enriched = await Promise.all(projs.map(async proj => {
      const { data: comps } = await supabase.from("project_components")
        .select(`id, is_required, quantity, product:products(id,name,image_url,price)`)
        .eq("project_id", proj.id);
      return { ...proj, components: comps || [] };
    }));
    setProjects(enriched as any);
    setLoadingProjects(false);
  };

  useEffect(() => { if (tab === "projects" && projects.length === 0) fetchProjects(); }, [tab]);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p); setDnaSearch(""); setDnaResults([]); fetchDna(p.id);
  };

  const handleAddDna = async () => {
    if (!selectedProduct || !relProduct) return toast.error("Select both products");
    if (selectedProduct.id === relProduct.id) return toast.error("Cannot relate a product to itself");
    setSavingDna(true);
    const { error } = await supabase.from("component_dna").insert({
      product_id: selectedProduct.id,
      related_product_id: relProduct.id,
      relationship_type: relType,
      reason: relReason.trim() || null,
      sort_order: dnaRows.length,
    });
    if (error) {
      error.code === "23505" ? toast.error("This relationship already exists") : toast.error("Failed to add relationship");
    } else {
      toast.success("Relationship added!");
      setRelProduct(null); setRelReason(""); setRelType("required");
      fetchDna(selectedProduct.id);
    }
    setSavingDna(false);
  };

  const handleDeleteDna = async (id: string) => {
    await supabase.from("component_dna").delete().eq("id", id);
    if (selectedProduct) fetchDna(selectedProduct.id);
    toast.success("Relationship removed");
  };

  const handleCreateProject = async () => {
    if (!projForm.name.trim()) return toast.error("Project name required");
    setSavingProject(true);
    const { error } = await supabase.from("product_projects").insert({
      name: projForm.name.trim(),
      description: projForm.description.trim() || null,
      difficulty: projForm.difficulty,
      youtube_query: projForm.youtube_query.trim() || null,
    });
    if (!error) {
      toast.success("Project created!");
      setProjForm({ name:"", description:"", difficulty:"beginner", youtube_query:"" });
      setShowProjectForm(false);
      fetchProjects();
    } else toast.error("Failed to create project");
    setSavingProject(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("product_projects").delete().eq("id", id);
    fetchProjects();
    toast.success("Project deleted");
  };

  const handleAddComponent = async (projectId: string) => {
    if (!compProduct) return toast.error("Select a product");
    setSavingComp(true);
    const { error } = await supabase.from("project_components").insert({
      project_id: projectId, product_id: compProduct.id, is_required: compRequired, quantity: compQty,
    });
    if (error) {
      error.code === "23505" ? toast.error("Already added to this project") : toast.error("Failed to add component");
    } else {
      toast.success("Component added!");
      setCompProduct(null); setCompSearch(""); setCompQty(1); setCompRequired(true);
      fetchProjects();
    }
    setSavingComp(false);
  };

  const handleRemoveComponent = async (id: string) => {
    await supabase.from("project_components").delete().eq("id", id);
    fetchProjects();
    toast.success("Component removed");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-400" /> Seyal DNA Manager
          </h1>
          <p className="text-sm text-white/50">Map component relationships and manage project templates.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {[{ id:"dna", label:"Component DNA", icon:<Network className="w-4 h-4"/> }, { id:"projects", label:"Projects", icon:<BookOpen className="w-4 h-4"/> }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-purple-500 text-purple-300" : "border-transparent text-white/40 hover:text-white"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── DNA TAB ── */}
        {tab === "dna" && (
          <motion.div key="dna" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Step 1: Pick base product */}
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center font-bold">1</span>
                Select Base Product
              </p>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={selectedProduct ? selectedProduct.name : dnaSearch}
                  onChange={e => { setDnaSearch(e.target.value); if (selectedProduct) { setSelectedProduct(null); setDnaRows([]); } }}
                  placeholder="Search product…"
                  className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/50" />
                <AnimatePresence>
                  {dnaResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-[#111118] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                      {dnaResults.map(p => (
                        <button key={p.id} onClick={() => handleSelectProduct(p)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/5 text-left transition-colors">
                          <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-sm text-white">{p.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {selectedProduct && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl max-w-md">
                  <img src={selectedProduct.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-sm font-medium text-white">{selectedProduct.name}</span>
                  <button onClick={() => { setSelectedProduct(null); setDnaRows([]); }} className="ml-auto text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {selectedProduct && (
              <>
                {/* Step 2: Add relationship */}
                <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-4">
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center font-bold">2</span>
                    Add Relationship
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Related product search */}
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Related Product</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input value={relProduct ? relProduct.name : relSearch}
                          onChange={e => { setRelSearch(e.target.value); if (relProduct) setRelProduct(null); }}
                          placeholder="Search related product…"
                          className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/50" />
                        <AnimatePresence>
                          {relResults.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-[#111118] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                              {relResults.map(p => (
                                <button key={p.id} onClick={() => { setRelProduct(p); setRelSearch(""); setRelResults([]); }}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/5 text-left">
                                  <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                  <span className="text-sm text-white">{p.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Relationship type */}
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Relationship Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {REL_TYPES.map(rt => (
                          <button key={rt.value} onClick={() => setRelType(rt.value)}
                            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left ${relType === rt.value ? "border-purple-500/50 bg-purple-500/10 text-purple-300" : "border-white/10 text-white/50 hover:border-white/20"}`}
                            style={relType === rt.value ? { borderColor: `${rt.color}50`, color: rt.color, background: `${rt.color}15` } : {}}>
                            {rt.label}
                            <span className="block text-[10px] opacity-60 mt-0.5 font-normal">{rt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Reason <span className="opacity-50">(optional — shown to users)</span></label>
                    <Input value={relReason} onChange={e => setRelReason(e.target.value)}
                      placeholder="e.g. Needs 5V regulated power to operate safely"
                      className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30" />
                  </div>

                  <Button onClick={handleAddDna} disabled={savingDna || !relProduct}
                    className="gradient-primary text-white gap-2">
                    <Plus className="w-4 h-4" />
                    {savingDna ? "Adding…" : "Add Relationship"}
                  </Button>
                </div>

                {/* Step 3: Existing relationships */}
                <div className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center font-bold">3</span>
                    <span className="text-sm font-semibold text-white">Current Relationships</span>
                    <span className="ml-auto text-xs text-white/30">{dnaRows.length} mapped</span>
                  </div>

                  {loadingDna ? (
                    <div className="text-center py-8 text-white/30 text-sm">Loading…</div>
                  ) : dnaRows.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-sm">No relationships yet for this product.</div>
                  ) : (
                    dnaRows.map(row => {
                      const rtMeta = REL_TYPES.find(r => r.value === row.relationship_type);
                      return (
                        <div key={row.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                          <img src={row.related_product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{row.related_product.name}</p>
                            {row.reason && <p className="text-xs text-white/40 truncate">{row.reason}</p>}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-lg font-medium shrink-0"
                            style={{ color: rtMeta?.color, background: `${rtMeta?.color}18` }}>
                            {rtMeta?.label}
                          </span>
                          <button onClick={() => handleDeleteDna(row.id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {!selectedProduct && (
              <div className="text-center py-16 text-white/20">
                <Network className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a product above to manage its DNA relationships</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── PROJECTS TAB ── */}
        {tab === "projects" && (
          <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Create project */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
              <Button onClick={() => setShowProjectForm(!showProjectForm)} className="gap-2 gradient-primary text-white">
                {showProjectForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showProjectForm ? "Cancel" : "New Project"}
              </Button>
            </div>

            <AnimatePresence>
              {showProjectForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-[#111118] border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Create New Project</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Project Name *</label>
                      <Input value={projForm.name} onChange={e => setProjForm({...projForm, name: e.target.value})}
                        placeholder="e.g. Smart Weather Station"
                        className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Difficulty *</label>
                      <div className="flex gap-2 flex-wrap">
                        {DIFFICULTIES.map(d => (
                          <button key={d} onClick={() => setProjForm({...projForm, difficulty: d})}
                            className={`px-3 py-1.5 rounded-lg border text-xs capitalize font-medium transition-all ${projForm.difficulty === d ? "text-white" : "border-white/10 text-white/40"}`}
                            style={projForm.difficulty === d ? { borderColor: `${DIFF_COLORS[d]}50`, background: `${DIFF_COLORS[d]}20`, color: DIFF_COLORS[d] } : {}}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-white/50 mb-1.5 block">Description</label>
                      <Input value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})}
                        placeholder="Brief description of the project…"
                        className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-white/50 mb-1.5 block">YouTube Search Query</label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input value={projForm.youtube_query} onChange={e => setProjForm({...projForm, youtube_query: e.target.value})}
                          placeholder="e.g. Arduino weather station DHT11 tutorial"
                          className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30 pl-10" />
                      </div>
                      <p className="text-[11px] text-white/30 mt-1">This will be used as a YouTube search link — no hallucinated URLs.</p>
                    </div>
                  </div>
                  <Button onClick={handleCreateProject} disabled={savingProject} className="gradient-primary text-white gap-2">
                    <Plus className="w-4 h-4" /> {savingProject ? "Creating…" : "Create Project"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Projects list */}
            {loadingProjects ? (
              <div className="text-center py-12 text-white/30 text-sm">Loading projects…</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 bg-[#111118] rounded-2xl border border-white/5 text-white/30">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No projects yet. Create your first one above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project, i) => (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-4 px-5 py-4">
                      <button onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        className="flex items-center gap-3 flex-1 text-left min-w-0">
                        <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${expandedProject === project.id ? "rotate-180" : ""}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{project.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                              style={{ color: DIFF_COLORS[project.difficulty], background: `${DIFF_COLORS[project.difficulty]}18` }}>
                              {project.difficulty}
                            </span>
                            <span className="text-xs text-white/30">{project.components.length} components</span>
                          </div>
                        </div>
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)}
                        className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded: components */}
                    <AnimatePresence>
                      {expandedProject === project.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 overflow-hidden">
                          <div className="p-5 space-y-4">
                            {/* Existing components */}
                            {project.components.length > 0 && (
                              <div className="space-y-2">
                                {project.components.map(comp => (
                                  <div key={comp.id} className="flex items-center gap-3 p-3 bg-[#0B0B0F] rounded-xl">
                                    <img src={comp.product.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                                    <span className="text-sm text-white flex-1 truncate">{comp.product.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${comp.is_required ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                                      {comp.is_required ? "required" : "optional"}
                                    </span>
                                    <span className="text-xs text-white/40">×{comp.quantity}</span>
                                    <button onClick={() => handleRemoveComponent(comp.id)}
                                      className="p-1 text-white/20 hover:text-red-400 transition-colors">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add component form */}
                            <div className="bg-[#0B0B0F] rounded-xl p-4 space-y-3">
                              <p className="text-xs text-white/40 font-medium">Add Component</p>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                                <input value={compProduct ? compProduct.name : compSearch}
                                  onChange={e => { setCompSearch(e.target.value); if (compProduct) setCompProduct(null); }}
                                  placeholder="Search product…"
                                  className="w-full bg-[#111118] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50" />
                                <AnimatePresence>
                                  {compResults.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                      className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                                      {compResults.map(p => (
                                        <button key={p.id} onClick={() => { setCompProduct(p); setCompSearch(""); setCompResults([]); }}
                                          className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/5 text-left">
                                          <img src={p.image_url} alt="" className="w-7 h-7 rounded object-cover" />
                                          <span className="text-xs text-white">{p.name}</span>
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="flex gap-3 items-center">
                                <div className="flex gap-2">
                                  {[true, false].map(req => (
                                    <button key={String(req)} onClick={() => setCompRequired(req)}
                                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${compRequired === req ? (req ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-green-500/15 border-green-500/30 text-green-400") : "border-white/10 text-white/40"}`}>
                                      {req ? "Required" : "Optional"}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 ml-auto">
                                  <span className="text-xs text-white/40">Qty:</span>
                                  <button onClick={() => setCompQty(q => Math.max(1, q-1))} className="w-6 h-6 rounded text-white/50 hover:text-white text-center">−</button>
                                  <span className="w-6 text-center text-sm text-white">{compQty}</span>
                                  <button onClick={() => setCompQty(q => q+1)} className="w-6 h-6 rounded text-white/50 hover:text-white text-center">+</button>
                                </div>
                              </div>
                              <Button onClick={() => handleAddComponent(project.id)} disabled={savingComp || !compProduct}
                                size="sm" className="gradient-primary text-white gap-1.5 text-xs">
                                <Plus className="w-3.5 h-3.5" /> Add to Project
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default AdminDNAManager;