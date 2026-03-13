import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  BookOpen, Plus, Trash2, Eye, EyeOff, Edit2, X,
  Tag, Clock, Save, Globe, Lock, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tag: string;
  tag_color: string;
  read_time: string;
  published: boolean;
  created_at: string;
};

const TAG_COLORS = [
  { value: "blue",   label: "Blue",   cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "purple", label: "Purple", cls: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { value: "green",  label: "Green",  cls: "text-green-400 bg-green-400/10 border-green-400/20" },
  { value: "red",    label: "Red",    cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  { value: "yellow", label: "Yellow", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
];

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const EMPTY_FORM = { title: "", slug: "", excerpt: "", content: "", tag: "Tutorial", tag_color: "blue", read_time: "5 min read", published: false };

const AdminBlog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (post: Post) => {
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, tag: post.tag, tag_color: post.tag_color, read_time: post.read_time, published: post.published });
    setEditingId(post.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    if (!form.content.trim()) return toast.error("Content is required");

    setSaving(true);
    const payload = { ...form, slug: slugify(form.slug) };

    if (editingId) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingId);
      if (error) { toast.error(error.code === "23505" ? "Slug already exists" : "Failed to update"); }
      else { toast.success("Post updated!"); setShowForm(false); setEditingId(null); fetchPosts(); }
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast.error(error.code === "23505" ? "Slug already exists — try a different title" : "Failed to create post"); }
      else { toast.success("Post created!"); setShowForm(false); setForm(EMPTY_FORM); fetchPosts(); }
    }
    setSaving(false);
  };

  const handleTogglePublish = async (post: Post) => {
    const { error } = await supabase.from("blog_posts").update({ published: !post.published }).eq("id", post.id);
    if (!error) { toast.success(post.published ? "Post unpublished" : "Post published!"); fetchPosts(); }
  };

  const handleDelete = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    await supabase.from("blog_posts").delete().eq("id", post.id);
    toast.success("Post deleted");
    fetchPosts();
  };

  const tagColorCls = (color: string) => TAG_COLORS.find(t => t.value === color)?.cls || TAG_COLORS[0].cls;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" /> Blog Manager
          </h1>
          <p className="text-sm text-white/50">Create and manage blog posts. Published posts appear on the frontend.</p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-white gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "Edit Post" : "Create New Post"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="text-xs text-white/50 mb-1.5 block">Title *</label>
                <Input
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. Getting Started with Arduino"
                  className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Slug (URL) *</label>
                <Input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="getting-started-with-arduino"
                  className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30 font-mono text-sm"
                />
                <p className="text-[11px] text-white/30 mt-1">/blog/{form.slug || "your-slug"}</p>
              </div>

              {/* Read time */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Read Time</label>
                <Input
                  value={form.read_time}
                  onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))}
                  placeholder="5 min read"
                  className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              {/* Tag */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Tag</label>
                <Input
                  value={form.tag}
                  onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                  placeholder="Tutorial, IoT, Opinion…"
                  className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              {/* Tag Color */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Tag Color</label>
                <div className="flex gap-2 flex-wrap">
                  {TAG_COLORS.map(tc => (
                    <button key={tc.value} onClick={() => setForm(f => ({ ...f, tag_color: tc.value }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${tc.cls} ${form.tag_color === tc.value ? "ring-2 ring-white/30" : "opacity-60 hover:opacity-100"}`}>
                      {tc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div className="md:col-span-2">
                <label className="text-xs text-white/50 mb-1.5 block">Excerpt (shown on blog list)</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  placeholder="A short summary shown on the blog listing page…"
                  className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              {/* Content */}
              <div className="md:col-span-2">
                <label className="text-xs text-white/50 mb-1.5 block">Content * <span className="opacity-50">(supports line breaks)</span></label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={12}
                  placeholder="Write your full blog post content here…"
                  className="w-full bg-[#0B0B0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 resize-y font-mono leading-relaxed"
                />
              </div>

              {/* Publish toggle */}
              <div className="md:col-span-2 flex items-center gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.published
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-white/5 border-white/10 text-white/50"
                  }`}
                >
                  {form.published ? <><Globe className="w-4 h-4" /> Published</> : <><Lock className="w-4 h-4" /> Draft</>}
                </button>
                <p className="text-xs text-white/30">
                  {form.published ? "Visible to all users on /blog" : "Only visible to you in admin"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : editingId ? "Update Post" : "Save Post"}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/50">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts list */}
      {loading ? (
        <div className="text-center py-12 text-white/30 text-sm">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-[#111118] border border-white/5 rounded-2xl">
          <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No posts yet. Write your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden"
            >
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <button
                  onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                  className="flex items-center gap-3 flex-1 text-left min-w-0"
                >
                  <ChevronDown className={`w-4 h-4 text-white/30 shrink-0 transition-transform ${expandedId === post.id ? "rotate-180" : ""}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tagColorCls(post.tag_color)}`}>
                        {post.tag}
                      </span>
                      <span className="text-xs text-white/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{post.read_time}
                      </span>
                      <span className="text-xs text-white/30">
                        {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Publish toggle */}
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      post.published
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}
                  >
                    {post.published ? <><Globe className="w-3.5 h-3.5" /> Live</> : <><Lock className="w-3.5 h-3.5" /> Draft</>}
                  </button>
                  <button onClick={() => openEdit(post)} className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-purple-400 hover:border-purple-400/30 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(post)} className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded preview */}
              <AnimatePresence>
                {expandedId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="px-5 py-4 space-y-3">
                      <div>
                        <p className="text-xs text-white/30 mb-1">Excerpt</p>
                        <p className="text-sm text-white/60">{post.excerpt || <span className="italic opacity-40">No excerpt</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/30 mb-1">Content preview</p>
                        <p className="text-sm text-white/50 line-clamp-3 leading-relaxed">{post.content}</p>
                      </div>
                      <p className="text-xs text-white/20 font-mono">/blog/{post.slug}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;