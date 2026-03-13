// @supabase/functions-disable-jwt

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

// ✅ CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Preflight
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
    const { amount, cart, user_id } = await req.json();

    // 🔒 Validation
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("🧾 Creating Razorpay order for user:", req.body.user_id);

    // 🔐 Razorpay auth
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    const razorpayRes = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // ₹ → paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          payment_capture: 1,
          notes: {
            cart: JSON.stringify(cart), // ✅ for webhook
            user_id: req.body.user_id || null,           // ✅ for invoice & profile
          },
        }),
      }
    );

    const order = await razorpayRes.json();

    if (!order.id) {
      return new Response(
        JSON.stringify({ error: "Razorpay order failed", order }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
  console.error("❌ Create order crash:", err);

  return res.status(500).json({
    error: "Create order failed",
    message: err?.message,
    stack: err?.stack,
  });
}
});


