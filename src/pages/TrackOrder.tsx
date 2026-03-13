import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";

type Order = {
  id: string;
  razorpay_order_id: string;
  amount: number;
  status: string;
  fulfillment_status: string;
  created_at: string;
  tracking_number: string | null;
  courier_name: string | null;
};

const fulfillmentSteps = [
  { key: "pending",    label: "Order Placed",   icon: Clock },
  { key: "processing", label: "Processing",     icon: Package },
  { key: "shipped",    label: "Shipped",        icon: Truck },
  { key: "delivered",  label: "Delivered",      icon: CheckCircle },
];

const stepIndex = (status: string) => {
  const map: Record<string, number> = {
    pending: 0, processing: 1, shipped: 2, delivered: 3,
  };
  return map[status] ?? 0;
};

const statusColor: Record<string, string> = {
  pending:    "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  processing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  shipped:    "text-purple-400 bg-purple-400/10 border-purple-400/20",
  delivered:  "text-green-500 bg-green-500/10 border-green-500/20",
};

const TrackOrder = () => {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setOrder(null);

    // Try matching order ID or Razorpay order ID
    const { data, error: err } = await supabase
      .from("orders")
      .select("id, razorpay_order_id, amount, status, fulfillment_status, created_at, tracking_number, courier_name")
      .or(`id.eq.${q},razorpay_order_id.eq.${q}`)
      .single();

    if (err || !data) {
      setError("No order found with that ID. Please double-check and try again.");
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const currentStep = order ? stepIndex(order.fulfillment_status) : -1;

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="pt-24 pb-16">

        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <Search className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Track Your <span className="text-gradient">Order</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Enter your Order ID to get a live status update on your shipment.
              </p>

              {/* Search box */}
              <div className="flex gap-3 max-w-md mx-auto">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter Order ID"
                  className="flex-1 bg-card/80 border-border"
                />
                <Button variant="hero" onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Track
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Your Order ID is in your confirmation email or on your profile page.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="container mx-auto px-4 max-w-xl mt-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Order result */}
        {order && (
          <section className="py-10">
            <div className="container mx-auto px-4 max-w-2xl space-y-6">

              {/* Summary card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-foreground text-sm">{order.id.slice(0, 8).toUpperCase()}...</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Order Date</p>
                    <p className="text-sm text-foreground font-medium">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-sm text-foreground font-medium">₹{order.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${statusColor[order.fulfillment_status] || "text-muted-foreground bg-muted border-border"}`}>
                      {order.fulfillment_status}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Progress tracker */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <h3 className="font-semibold text-foreground mb-6">Shipment Progress</h3>
                <div className="flex items-start justify-between relative">
                  {/* Progress line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-6" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-primary mx-6 transition-all duration-700"
                    style={{ width: `${(currentStep / (fulfillmentSteps.length - 1)) * 100}%`, right: "auto" }}
                  />

                  {fulfillmentSteps.map((step, i) => {
                    const done = i <= currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          done ? "gradient-primary border-primary shadow-glow" : "bg-muted border-border"
                        }`}>
                          <step.icon className={`w-4 h-4 ${done ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`text-xs text-center font-medium ${done ? "text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tracking details */}
              {order.fulfillment_status === "shipped" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-card border border-[#813FF133]"
                >
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" /> Tracking Details
                  </h3>
                  <div className="space-y-3">
                    {order.courier_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Courier</span>
                        <span className="font-medium text-foreground">{order.courier_name}</span>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tracking Number</span>
                        <span className="font-mono font-medium text-primary">{order.tracking_number}</span>
                      </div>
                    )}
                    {!order.tracking_number && (
                      <p className="text-sm text-muted-foreground">Tracking number will be updated shortly.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Not shipped yet note */}
              {(order.fulfillment_status === "pending" || order.fulfillment_status === "processing") && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-400/10 border border-blue-400/20">
                  <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Your order is being processed and will be dispatched within 24 business hours. You'll receive a tracking number via email once shipped.
                  </p>
                </div>
              )}

            </div>
          </section>
        )}

        {/* Help note */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <p className="text-sm text-muted-foreground">
              Having trouble finding your order?{" "}
              <a href="/contact" className="text-primary underline underline-offset-2">Contact us</a>{" "}
              and we'll help you track it down.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;