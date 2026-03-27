import { CheckCircle, Download } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 2000;

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDER + ITEMS (with retry) ================= */
  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchWithRetry = async () => {
      console.log("🔍 Looking for payment_id:", paymentId);

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;

        try {
          // 1️⃣ Fetch order
          const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("razorpay_payment_id", paymentId)
            .maybeSingle();

          if (orderError) {
            console.error(`❌ Attempt ${attempt} - order error:`, orderError);
          }

          if (orderData) {
            setOrder(orderData);

            // 2️⃣ Fetch order items with product relation
            const { data: orderItems, error: itemsError } = await supabase
              .from("order_items")
              .select(
                "quantity,product:products!order_items_product_id_fkey(id,name,image_url,price,offer_price,hsn_sac)"
              )
              .eq("order_id", orderData.id);

            console.log("🧪 RAW order_items response:", orderItems);

            if (itemsError) {
              console.error("❌ Failed to fetch order items:", itemsError);
            } else {
              setItems(orderItems || []);
            }

            setLoading(false);
            return; // ✅ success, stop retrying
          }

          console.warn(
            `⏳ Attempt ${attempt}/${MAX_RETRIES} - order not found yet, retrying in ${RETRY_DELAY_MS}ms...`
          );
        } catch (err) {
          console.error(`❌ Attempt ${attempt} - unexpected error:`, err);
        }

        // Wait before next retry (skip wait on last attempt)
        if (attempt < MAX_RETRIES) {
          await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
        }
      }

      // All retries exhausted
      if (!cancelled) setLoading(false);
    };

    fetchWithRetry();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  /* ================= SAFETY CHECK (after hooks) ================= */
  if (!paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold">Invalid Order</h2>
          <p className="text-muted-foreground">Payment reference not found.</p>
        </div>
      </div>
    );
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading your order...</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait, confirming your payment...
          </p>
        </div>
      </div>
    );
  }

  /* ================= ORDER NOT FOUND ================= */
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold">Order Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't find an order matching this payment reference.
          </p>
        </div>
      </div>
    );
  }

  /* ================= TOTAL ================= */
  const totalAmount = order?.amount ?? 0;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6">

        {/* SUCCESS ICON */}
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-center mb-1">
          Payment Successful 🎉
        </h1>

        <p className="text-muted-foreground text-center mb-6">
          Your order has been placed successfully.
        </p>

        {/* ================= ORDER META ================= */}
        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium">{order.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-medium">{order.razorpay_payment_id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Date</span>
            <span className="font-medium">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* ================= ITEMS ================= */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Items Purchased</h3>

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No items found for this order.
            </p>
          )}

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const product = item.product;

              if (!product) {
                return (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground border border-border rounded-lg p-3"
                  >
                    Product details unavailable
                  </div>
                );
              }

              const unitPrice =
                product.offer_price !== null &&
                product.offer_price !== undefined
                  ? product.offer_price
                  : product.price;

              return (
                <div
                  key={index}
                  className="flex items-center gap-4 border border-border rounded-lg p-3"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-14 h-14 rounded-md object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    {product.offer_price && (
                      <p className="text-xs text-muted-foreground line-through">
                        ₹{product.price}
                      </p>
                    )}
                    <p className="font-semibold">₹{unitPrice * item.quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= TOTAL ================= */}
        <div className="flex justify-between font-bold text-lg mb-6 border-t border-border pt-4">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col gap-3 mt-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              if (!order?.id) return;
              const invoiceUrl = `${import.meta.env.VITE_BACKEND_URL}/download-invoice/${order.id}`;
              window.open(invoiceUrl, "_blank");
            }}
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </Button>

          <Link to="/products">
            <Button variant="hero" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;