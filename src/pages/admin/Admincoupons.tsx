import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, Percent, X } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discount_percent: "",
    description: "",
    expires_at: "",
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    const pct = parseInt(form.discount_percent);

    if (!code) return toast.error("Coupon code is required");
    if (isNaN(pct) || pct <= 0 || pct > 100) return toast.error("Discount must be between 1–100%");

    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code,
      discount_percent: pct,
      description: form.description.trim() || null,
      expires_at: form.expires_at || null,
    });

    if (error) {
      if (error.code === "23505") toast.error("A coupon with this code already exists.");
      else toast.error("Failed to create coupon.");
    } else {
      toast.success(`Coupon "${code}" created!`);
      setForm({ code: "", discount_percent: "", description: "", expires_at: "" });
      setShowForm(false);
      fetchCoupons();
    }
    setSaving(false);
  };

  const handleToggle = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);
    if (!error) {
      toast.success(`Coupon "${coupon.code}" ${coupon.is_active ? "deactivated" : "activated"}`);
      fetchCoupons();
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", coupon.id);
    if (!error) {
      toast.success(`Coupon "${coupon.code}" deleted.`);
      fetchCoupons();
    }
  };

  const isExpired = (expires_at: string | null) => {
    if (!expires_at) return false;
    return new Date(expires_at) < new Date();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Coupon Codes</h1>
          <p className="text-sm text-white/50">Create and manage discount coupons for your store.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-white gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Coupon"}
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              Create New Coupon
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Coupon Code <span className="text-red-400">*</span>
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE20"
                  className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30 font-mono tracking-widest"
                />
                <p className="text-xs text-white/30 mt-1">Auto-uppercased. No spaces.</p>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Discount % <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                    placeholder="e.g. 20"
                    className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30 pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Description <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Diwali Sale — 20% off"
                  className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Expiry Date <span className="text-white/30 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="bg-[#0B0B0F] border-white/10 text-white pl-9"
                  />
                </div>
                <p className="text-xs text-white/30 mt-1">Leave blank for no expiry.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="gradient-primary text-white gap-2"
              >
                {saving ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Coupon
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/50">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-12 text-white/40">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-[#111118] border border-white/10 rounded-2xl">
          <Tag className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No coupons yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon, i) => {
            const expired = isExpired(coupon.expires_at);
            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-[#111118] border rounded-2xl p-5 flex items-center gap-4 flex-wrap ${
                  !coupon.is_active || expired
                    ? "border-white/5 opacity-60"
                    : "border-white/10"
                }`}
              >
                {/* Code badge */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm tracking-widest ${
                    coupon.is_active && !expired
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}>
                    {coupon.code}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-green-400 font-bold text-sm">
                        {coupon.discount_percent}% off
                      </span>
                      {coupon.description && (
                        <span className="text-white/40 text-xs truncate">{coupon.description}</span>
                      )}
                      {expired && (
                        <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                          Expired
                        </span>
                      )}
                      {!coupon.is_active && !expired && (
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                      <span>Created {new Date(coupon.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {coupon.expires_at && (
                        <span>· Expires {new Date(coupon.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(coupon)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    style={{
                      borderColor: coupon.is_active ? "#22c55e33" : "#ffffff22",
                      color: coupon.is_active ? "#22c55e" : "#ffffff66",
                      background: coupon.is_active ? "#22c55e11" : "transparent",
                    }}
                  >
                    {coupon.is_active
                      ? <><ToggleRight className="w-4 h-4" /> Active</>
                      : <><ToggleLeft className="w-4 h-4" /> Inactive</>
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(coupon)}
                    className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;