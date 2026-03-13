// @supabase/functions-disable-jwt

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ===================== ENV ===================== */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

/* ===================== SUPABASE ===================== */
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/* ===================== CORS ===================== */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* ===================== SERVER ===================== */
serve(async (req) => {
  console.log("🔥 Razorpay webhook triggered");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    if (!WEBHOOK_SECRET) {
      throw new Error("Missing webhook secret");
    }

    /* ================= RAW BODY ================= */
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response("Missing signature", {
        status: 400,
        headers: corsHeaders,
      });
    }

    /* ================= VERIFY SIGNATURE ================= */
    const expectedSignature = createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Invalid Razorpay signature");
      return new Response("Invalid signature", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const event = JSON.parse(body);
    console.log("✅ Verified event:", event.event);

    if (
      event.event !== "payment.captured" &&
      event.event !== "order.paid"
    ) {
      return new Response("Ignored", {
        status: 200,
        headers: corsHeaders,
      });
    }

    /* ================= PAYMENT DATA ================= */
    const payment = event.payload.payment.entity;

    const paymentId = payment.id;
    const razorpayOrderId = payment.order_id;
    const amount = payment.amount / 100;

    const cart = payment.notes?.cart
      ? JSON.parse(payment.notes.cart)
      : [];

    const userId = payment.notes?.user_id || null;

    /* ================= IDEMPOTENCY ================= */
    const { data: processed } = await supabase.rpc(
      "mark_payment_processed",
      { p_payment_id: paymentId }
    );

    if (!processed) {
      console.log("🔁 Duplicate webhook ignored:", paymentId);
      return new Response("Already processed", {
        status: 200,
        headers: corsHeaders,
      });
    }

    /* ================= STOCK CHECK ================= */
    for (const item of cart) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.id}`);
      }
    }

    /* ================= CREATE ORDER ================= */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        amount,
        status: "paid",
        user_id: userId, // ✅ IMPORTANT
        fulfillment_status: "placed",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    console.log("🎉 Order created:", order.id);

    /* ================= ORDER ITEMS ================= */
    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    /* ================= REDUCE STOCK ================= */
    for (const item of cart) {
      const { error } = await supabase.rpc(
        "decrement_product_stock",
        {
          p_product_id: item.id,
          p_quantity: item.quantity,
        }
      );

      if (error) throw error;
    }

    /* ================= FETCH CUSTOMER (FOR INVOICE) ================= */
    let customer = null;

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          full_name,
          phone,
          country_code,
          address_line1,
          address_line2,
          city,
          state,
          postal_code
        `)
        .eq("id", userId)
        .single();

      if (profile) {
        customer = {
          name: profile.full_name,
          phone: profile.phone,
          address: [
            profile.address_line1,
            profile.address_line2,
            profile.city,
            profile.state,
            profile.postal_code,
          ]
            .filter(Boolean)
            .join(", "),
        };
      }
    }

    console.log("👤 Customer snapshot:", customer);

    /* 🔜 NEXT
       - trigger invoice generation
       - email invoice
       - store invoice metadata
    */

    return new Response("OK", {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Webhook failed", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
