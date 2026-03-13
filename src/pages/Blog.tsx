import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { BookOpen, Clock, Tag, ChevronDown, ChevronUp, Calendar } from "lucide-react";

type Post = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  tag: string; tag_color: string; read_time: string; published: boolean; created_at: string;
};

const TAG_COLOR_MAP: Record<string, string> = {
  blue:   "text-blue-400 bg-blue-400/10 border-blue-400/20",
  purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  green:  "text-green-400 bg-green-400/10 border-green-400/20",
  red:    "text-red-400 bg-red-400/10 border-red-400/20",
  yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPosts(data); setLoading(false); });
  }, []);

  const tagCls = (color: string) => TAG_COLOR_MAP[color] || TAG_COLOR_MAP.blue;

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="pt-24 pb-16">
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                The Ajashia <span className="text-gradient">Blog</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Tutorials, project ideas, and thoughts from the Ajashia team on electronics, IoT, and making.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl space-y-6">
            {loading ? (
              <div className="text-center py-16 text-muted-foreground text-sm">Loading posts…</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No posts yet. Check back soon!
              </div>
            ) : posts.map((post, i) => {
              const isExpanded = expandedId === post.id;
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tagCls(post.tag_color)}`}>
                        <Tag className="w-3 h-3 inline mr-1" />{post.tag}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{post.read_time}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>}
                    <button onClick={() => setExpandedId(isExpanded ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline transition-colors">
                      {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read Full Post</>}
                    </button>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden">
                        <div className="px-6 pb-6 border-t border-border pt-5">
                          {post.content.split("\n").map((line, i) =>
                            line.trim() === "" ? <div key={i} className="h-3" /> :
                            <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-center py-8 text-muted-foreground text-sm">
              More posts coming soon. Follow us on Instagram for updates.
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;