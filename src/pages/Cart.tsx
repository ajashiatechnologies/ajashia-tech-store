import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadRazorpay } from "@/lib/razorpay";
import { useAuthContext } from "@/context/AuthProvider";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Tag,
  X,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const SHIPPING_CHARGE = 49;

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { items: cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.floor((subtotal * appliedCoupon.discount_percent) / 100) : 0;
  const shipping = cartItems.length === 0 ? 0 : subtotal >= 499 ? 0 : SHIPPING_CHARGE;
  const grandTotal = subtotal - discountAmount + shipping;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return toast.error("Enter a coupon code");
    if (appliedCoupon?.code === code) return toast.info("This coupon is already applied");

    setCouponLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/coupon/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid coupon code");
        return;
      }

      setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent });
      toast.success(`Coupon "${data.code}" applied! ${data.discount_percent}% off your order.`);
      setCouponCode("");
    } catch {
      toast.error("Could not validate coupon. Check if the server is running.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const createRazorpayOrder = async (amount: number, cart: any[], coupon: typeof appliedCoupon, discount: number) => {
    const res = await fetch(`${BACKEND_URL}/create-razorpay-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        cart,
        user_id: user?.id || null,
        shipping: shipping,
        discount: discount,
        coupon_code: coupon?.code || null,
      }),
    });
    if (!res.ok) throw new Error("Failed to create Razorpay order");
    return await res.json();
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/auth/sign-in");
      return;
    }

    try {
      const order = await createRazorpayOrder(grandTotal, cartItems, appliedCoupon, discountAmount);
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Ajashia Tech Store",
        description: "Order Payment",
        order_id: order.id,
        handler: function (response: any) {
          toast.success("Payment successful! Your order is being processed.");
          clearCart();
          setTimeout(() => {
            navigate(`/order-success?payment_id=${response.razorpay_payment_id}`);
          }, 800);
        },
        modal: { ondismiss() { console.log("❌ Payment cancelled"); } },
        theme: { color: "#813FF1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Checkout failed");
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">{cartItems.length} items in your cart</p>
          </motion.div>

          {/* Empty Cart */}
          {cartItems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
              <Link to="/products">
                <Button variant="hero">Continue Shopping</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-4"
              >
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 bg-card rounded-2xl border border-border"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-foreground mt-1">₹{item.price}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            disabled={item.quantity >= item.stock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className={`p-2 ${item.quantity >= item.stock ? "opacity-40 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Order Summary */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Order Summary</h2>

                  {/* Coupon Input */}
                  {!appliedCoupon ? (
                    <div className="flex gap-2 mb-6">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          className="pl-10 bg-muted/50 border-border font-mono tracking-wider"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? (
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                        ) : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mb-6 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span className="text-sm font-mono font-bold text-green-400">{appliedCoupon.code}</span>
                        <span className="text-xs text-green-400/70">— {appliedCoupon.discount_percent}% off</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({appliedCoupon.discount_percent}%)</span>
                        <span>− ₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span className={shipping === 0 ? "text-green-400 font-medium" : ""}>
                        {shipping === 0 ? "Free" : `₹${SHIPPING_CHARGE}`}
                      </span>
                    </div>
                    {shipping === 0 && subtotal > 0 && (
                      <p className="text-xs text-green-400/70">🎉 You qualify for free delivery!</p>
                    )}
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground/60">Add ₹{(499 - subtotal).toFixed(0)} more for free delivery</p>
                    )}

                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                      <span>Total</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full mt-6 group"
                    onClick={handlePayment}
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <Link to="/products" className="block text-center mt-4">
                    <Button variant="link" className="text-muted-foreground">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;