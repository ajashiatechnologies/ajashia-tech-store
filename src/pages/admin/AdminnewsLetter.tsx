import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Users, UserCheck, UserMinus, Eye, EyeOff, Mail } from "lucide-react";

const BACKEND_URL = "http://localhost:4000";
type Stats = { total: number; active: number; unsubscribed: number };

const defaultHtml = (subject: string, body: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e2e8f0; padding: 32px; border-radius: 12px;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
    <div style="width: 36px; height: 36px; background: #813FF1; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
      <span style="color: white; font-size: 18px;">⚡</span>
    </div>
    <div>
      <div style="font-weight: 700; font-size: 16px;">Ajashia Tech Store</div>
      <div style="font-size: 11px; color: #64748b;">ajashiatechnologies.com</div>
    </div>
  </div>
  <h2 style="color: #813FF1; margin-top: 0; font-size: 22px;">${subject}</h2>
  <div style="color: #94a3b8; line-height: 1.8; white-space: pre-line;">${body}</div>
  <div style="margin-top: 28px;">
    <a href="https://ajashiatechnologies.com/products" style="background: #813FF1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      Shop Now →
    </a>
  </div>
  <hr style="border-color: #1e293b; margin: 28px 0;" />
  <p style="color: #334155; font-size: 11px;">Ajashia Technologies · Chennai, Tamil Nadu, India · MSME Registered</p>
</div>
`;

const AdminNewsletter = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/newsletter/stats`);
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error("Failed to fetch newsletter stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and message body are required.");
      return;
    }
    setSending(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/newsletter/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          html: defaultHtml(subject, body),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send");

      setResult({ sent: data.sent, failed: data.failed, total: data.total });
      toast.success(`Newsletter sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}!`);
      setSubject("");
      setBody("");
      setShowPreview(false);

      // Refresh stats
      const statsRes = await fetch(`${BACKEND_URL}/newsletter/stats`);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Newsletter</h1>
        <p className="text-sm text-white/50">Compose and send emails to all active subscribers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total Signups", value: loadingStats ? "—" : stats?.total ?? 0, color: "text-white" },
          { icon: UserCheck, label: "Active Subscribers", value: loadingStats ? "—" : stats?.active ?? 0, color: "text-green-400" },
          { icon: UserMinus, label: "Unsubscribed", value: loadingStats ? "—" : stats?.unsubscribed ?? 0, color: "text-red-400" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#111118] border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-xs text-white/50">{s.label}</span>
            </div>
            <div className={`text-3xl font-bold ${s.color}`}>{String(s.value)}</div>
          </motion.div>
        ))}
      </div>

      {/* Compose */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-400" />
          Compose Newsletter
        </h2>

        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Subject Line</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New Arduino Mega boards are now in stock!"
            className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70 mb-2 block">Message Body</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your newsletter message here. Keep it concise and valuable for your subscribers."
            className="bg-[#0B0B0F] border-white/10 text-white placeholder:text-white/30 min-h-[180px]"
          />
          <p className="text-xs text-white/30 mt-1">Plain text — it will be auto-styled in the branded email template.</p>
        </div>

        {/* Preview toggle */}
        {subject && body && (
          <div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Hide Preview" : "Preview Email"}
            </button>

            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 rounded-xl overflow-hidden border border-white/10"
              >
                <div className="bg-white/5 px-4 py-2 text-xs text-white/40 border-b border-white/10">
                  Email Preview
                </div>
                <iframe
                  srcDoc={defaultHtml(subject, body)}
                  className="w-full h-96 bg-white"
                  title="Email Preview"
                />
              </motion.div>
            )}
          </div>
        )}

        {/* Send button */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="gradient-primary text-white gap-2 px-6"
          >
            {sending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {stats?.active ?? "all"} Subscribers
              </>
            )}
          </Button>
          {stats?.active === 0 && (
            <p className="text-xs text-yellow-400">No active subscribers yet.</p>
          )}
        </div>
      </motion.div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5"
        >
          <h3 className="font-semibold text-green-400 mb-2">Newsletter Sent!</h3>
          <div className="flex gap-6 text-sm">
            <span className="text-white/70">✅ Delivered: <strong className="text-white">{result.sent}</strong></span>
            {result.failed > 0 && (
              <span className="text-white/70">❌ Failed: <strong className="text-red-400">{result.failed}</strong></span>
            )}
            <span className="text-white/70">📬 Total: <strong className="text-white">{result.total}</strong></span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminNewsletter;