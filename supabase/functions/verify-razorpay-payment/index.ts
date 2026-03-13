// @supabase/functions-disable-jwt

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.224.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ ALWAYS respond to preflight FIRST
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ verified: false, error: "Missing fields" }),
        { status: 200, headers: corsHeaders }
      );
    }

    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!secret) {
      return new Response(
        JSON.stringify({ verified: false, error: "Secret missing" }),
        { status: 200, headers: corsHeaders }
      );
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    const verified = expectedSignature === razorpay_signature;

    return new Response(
      JSON.stringify({ verified }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ verified: false, error: String(err) }),
      { status: 200, headers: corsHeaders }
    );
  }
});
