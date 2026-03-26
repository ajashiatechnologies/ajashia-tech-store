import { fileURLToPath } from "url";
import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

/* ===================== EMAIL TRANSPORTER ===================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/* ===================== HELPERS ===================== */
function maskPhone(phone) {
  if (!phone || phone.length < 6) return "N/A";
  return `${phone.slice(0, 2)}xxxx${phone.slice(-4)}`;
}

async function sendOrderConfirmationEmail({ customer, order, invoiceNumber, invoicePath }) {
  if (!customer?.email) {
    console.warn("⚠️ No customer email found, skipping email.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Ajashia Tech Store" <${process.env.GMAIL_USER}>`,
      to: customer.email,
      subject: `Order Confirmed! #${order.id.slice(0, 8)} — Ajashia Tech Store`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #813FF1;">Payment Successful 🎉</h2>
          <p>Hi <strong>${customer.name || "there"}</strong>,</p>
          <p>Thank you for shopping with <strong>Ajashia Tech Store</strong>! Your order has been placed successfully.</p>

          <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #333;">Order Details</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #666;">Order ID</td>
                <td style="padding: 6px 0; font-weight: bold;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Payment ID</td>
                <td style="padding: 6px 0;">${order.razorpay_payment_id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Amount Paid</td>
                <td style="padding: 6px 0; font-weight: bold; color: #22c55e;">₹${order.amount}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Order Date</td>
                <td style="padding: 6px 0;">${new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666;">Delivery Address</td>
                <td style="padding: 6px 0;">${customer.address || "—"}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; color: #666;">
            Your invoice is attached to this email. We'll notify you once your order is packed and shipped.
          </p>

          <p style="margin-top: 24px; font-size: 13px; color: #999;">
            — Ajashia Tech Store<br/>
            <a href="http://localhost:8081" style="color: #813FF1;">ajashiatechstore.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          path: invoicePath,
        },
      ],
    });

    console.log("📧 Order confirmation email sent to:", customer.email);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
    // Don't throw — email failure shouldn't break the webhook
  }
}

function generateInvoicePDF({ order, items, invoiceNumber, customer, shippingCharge = 49, discountAmount = 0, couponCode = null }) {
  const invoicesDir = path.join(process.cwd(), "invoices");
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  const normal = () => doc.font("Helvetica");
  const bold = () => doc.font("Helvetica-Bold");

/* ================= HEADER ================= */

const logoPath = path.join(process.cwd(), "assets/logo.png");

// Logo (fixed size & position)
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, 50, 45, { width: 60 }); // clean size
}

// Company Name
bold()
  .fontSize(18)
  .fillColor("#000")
  .text("Ajashia Tech Store", 120, 50);

// Tagline
normal()
  .fontSize(10)
  .fillColor("#444")
  .text("Electronics & Innovation Store", 120, 72);

// Divider line
doc
  .moveTo(50, 105)
  .lineTo(545, 105)
  .stroke();

// INVOICE title (centered)
bold()
  .fontSize(14)
  .fillColor("#000")
  .text("INVOICE", 0, 120, { align: "center" });

// Move cursor below header (important for next content)
doc.y = 140;

  /* ================= CUSTOMER + META ================= */
  normal().fontSize(10).fillColor("#000");

  const metaTop = 145;

  bold().text("Bill To:", 50, metaTop);
  normal().text(customer?.name || "Customer", 50, metaTop + 15);
  normal().text(`Phone: ${maskPhone(customer?.phone)}`, 50, metaTop + 30);

  if (customer?.address) {
    normal()
      .fontSize(9)
      .fillColor("#333")
      .text(customer.address, 50, metaTop + 45, {
        width: 250,
        lineGap: 2,
      });
  }

  let rightY = metaTop;

  normal().text(`Invoice No: ${invoiceNumber}`, 350, rightY, {
    width: 180,
    align: "left",
  });

  rightY += 15;

  normal().text(`Order ID: ${order.id}`, 350, rightY, {
    width: 180,
    align: "left",
  });

  rightY += 25;

  normal().text(
    `Order Date: ${new Date(order.created_at).toLocaleDateString()}`,
    350,
    rightY,
    { width: 180, align: "left" }
  );

  /* ================= TABLE HEADER ================= */
  const tableTop = metaTop + 80;

  doc.rect(50, tableTop, 495, 22).fill("#4f9cf9");

  bold().fontSize(10).fillColor("#fff");
  doc.text("Item Name", 55, tableTop + 6);
  doc.text("HSN/SAC", 230, tableTop + 6);
  doc.text("Qty", 310, tableTop + 6);
  doc.text("Unit", 350, tableTop + 6);
  doc.text("Price", 410, tableTop + 6);
  doc.text("Amount", 480, tableTop + 6);

  /* ================= TABLE ROWS ================= */
  normal().fontSize(10).fillColor("#000");

  let y = tableTop + 30;

  items.forEach((item) => {
    const p = item.product;
    const price =
      p.offer_price !== null && p.offer_price !== undefined
        ? p.offer_price
        : p.price;

    doc.text(p.name, 50, y, { width: 170 });
    doc.text(p.hsn_sac || "-", 230, y);
    doc.text(item.quantity, 310, y);
    doc.text("Pcs", 350, y);
    doc.text(`₹${price}`, 410, y);
    doc.text(`₹${price * item.quantity}`, 480, y);

    y += 22;
    doc.moveTo(50, y - 5).lineTo(545, y - 5).strokeColor("#e0e0e0").stroke();
  });

  /* ================= TOTALS ================= */
  const totalsTop = y + 15;

  // Calculate subtotal from items
  const itemsSubtotal = items.reduce((sum, item) => {
    const p = item.product;
    const price = (p.offer_price !== null && p.offer_price !== undefined) ? p.offer_price : p.price;
    return sum + price * item.quantity;
  }, 0);

  bold().fontSize(10).fillColor("#000");
  doc.text("Subtotal:", 400, totalsTop);
  normal().text(`₹${itemsSubtotal.toFixed(2)}`, 480, totalsTop);

  let nextY = totalsTop + 15;

  // Show discount if coupon was applied
  if (discountAmount > 0) {
    bold().fillColor("#22c55e").text("Discount" + (couponCode ? ` (${couponCode})` : "") + ":", 350, nextY);
    normal().fillColor("#22c55e").text(`-₹${discountAmount.toFixed(2)}`, 480, nextY);
    nextY += 15;
  }

  bold().fillColor("#000").text("Shipping:", 400, nextY);
  normal().fillColor("#000").text(`₹${shippingCharge.toFixed(2)}`, 480, nextY);
  nextY += 15;

  doc.moveTo(400, nextY + 5).lineTo(545, nextY + 5).stroke();

  bold().fontSize(11);
  doc.text("Final Total:", 400, nextY + 15);
  doc.text(`₹${order.amount}`, 480, nextY + 15);

  /* ================= TERMS ================= */
  bold().fontSize(10).text("Terms & Conditions", 50, totalsTop + 90);
  normal()
    .fontSize(9)
    .text(
      "• No warranty unless specified\n• No returns or exchanges\n• Free delivery (if applicable)",
      50,
      totalsTop + 105
    );

  /* ================= FOOTER ================= */
  normal()
    .fontSize(9)
    .text(
      "Thank you for shopping with Ajashia Tech Store.\nThis is a system generated invoice.",
      0,
      760,
      { align: "center" }
    );

  doc.end();
  console.log("🧾 Invoice generated:", filePath);
  return filePath;
}

/* ===================== APP ===================== */
const app = express();

/* ===================== CORS ===================== */
app.use(
  cors({
    origin: [
      "http://localhost",
      "http://localhost:80",
      "http://localhost:8081",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

/* ========== Razorpay needs RAW body ONLY here ========= */
app.use("/razorpay-webhook", express.raw({ type: "application/json" }));

/* ========== Normal JSON for other routes ========= */
app.use(express.json());

/* ===================== SUPABASE ===================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("🔑 Supabase URL:", process.env.SUPABASE_URL);
console.log("🔑 Key role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 40));

/* ===================== KEYS ===================== */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

(async () => {
  const { data, error } = await supabase.from("products").select("id").limit(1);
  console.log(" TEST PRODUCTS:", data);
  console.log("TEST ERROR:", error);
})();

/* ===================================================
   1️⃣ CREATE RAZORPAY ORDER
   =================================================== */
app.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, cart, user_id, shipping, discount, coupon_code } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart required" });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1,
        notes: {
          cart: JSON.stringify(cart),
          user_id: user_id || null,
          shipping: shipping || 49,
          discount: discount || 0,
          coupon_code: coupon_code || null,
        },
      }),
    });

    const order = await razorpayRes.json();

    if (!order.id) {
      console.error("Razorpay error:", order);
      return res.status(500).json({ error: "Order creation failed" });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ===================================================
   2️⃣ RAZORPAY WEBHOOK
   =================================================== */
app.post("/razorpay-webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body.toString();

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(body);

    if (!["payment.captured", "order.paid"].includes(event.event)) {
      return res.status(200).send("Ignored");
    }

    const payment = event.payload.payment.entity;

    console.log("🛒 RAW notes from Razorpay:", payment.notes);
    console.log("🛒 Cart string:", payment.notes?.cart);

    let cart = [];

    try {
      if (payment.notes?.cart) {
        cart = JSON.parse(payment.notes.cart);
      }
    } catch (err) {
      console.error("❌ Failed to parse cart JSON:", err);
      return res.status(400).send("Invalid cart data");
    }

    console.log("✅ Parsed cart array:", cart);

    /* ================= STOCK CHECK ================= */
    for (const item of cart) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        console.error("❌ Product not found:", item.id);
        return res.status(400).send("Product not found");
      }

      if (product.stock < item.quantity) {
        console.error(
          `❌ Insufficient stock for ${item.name}: requested ${item.quantity}, available ${product.stock}`
        );
        return res.status(400).send("Insufficient stock");
      }

      console.log(`✅ Stock OK for ${item.name}: ${product.stock} available`);
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;
    const amount = payment.amount / 100;

    /* ================= IDEMPOTENCY ================= */
    const { data: processed } = await supabase.rpc("mark_payment_processed", {
      p_payment_id: paymentId,
    });

    if (!processed) {
      console.log("Duplicate webhook:", paymentId);
      return res.status(200).send("Already processed");
    }

    const userId = payment.notes?.user_id || null;
    const shippingCharge = parseFloat(payment.notes?.shipping ?? 49);
    const discountAmount = parseFloat(payment.notes?.discount || 0);
    const couponCode = payment.notes?.coupon_code || null;

    /* ================= CREATE ORDER ================= */
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        amount,
        status: "paid",
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("🎉 Order created:", order.id);

    /* ================= FETCH CUSTOMER PROFILE ================= */
    let customer = null;

    if (order.user_id) {
      const { data: customerProfile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          full_name,
          email,
          phone,
          country_code,
          address_line1,
          address_line2,
          city,
          state,
          postal_code
        `)
        .eq("id", order.user_id)
        .single();

      if (!profileError && customerProfile) {
        customer = {
          name: customerProfile.full_name,
          email: customerProfile.email,
          phone: customerProfile.phone,
          address: [
            customerProfile.address_line1,
            customerProfile.address_line2,
            customerProfile.city,
            customerProfile.state,
            customerProfile.postal_code,
          ]
            .filter(Boolean)
            .join(", "),
        };
      }
    }

    /* ================= ORDER ITEMS ================= */
    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ Failed to insert order items:", itemsError);
      return res.status(500).send("Failed to create order items");
    }

    console.log("📦 Order items inserted:", orderItems.length);

    /* ================= FETCH ITEMS FOR INVOICE ================= */
    const { data: fullItems, error: fetchItemsError } = await supabase
      .from("order_items")
      .select(`
        quantity,
        product:products (
          id,
          name,
          price,
          offer_price,
          hsn_sac,
          image_url
        )
      `)
      .eq("order_id", order.id);

    if (fetchItemsError) {
      console.error("❌ Failed to fetch items for invoice:", fetchItemsError);
      return res.status(500).send("Invoice data fetch failed");
    }

    /* ================= GENERATE INVOICE ================= */
    const invoiceNumber = `INV-${new Date().getFullYear()}-${order.id.slice(0, 6)}`;

    const invoicePath = generateInvoicePDF({
      order,
      items: fullItems,
      invoiceNumber,
      customer,
      shippingCharge,
      discountAmount,
      couponCode,
    });

    /* ================= SEND CONFIRMATION EMAIL ================= */
    await sendOrderConfirmationEmail({
      customer,
      order,
      invoiceNumber,
      invoicePath,
    });

    /* ================= REDUCE STOCK ================= */
    for (const item of cart) {
      const { error: stockError } = await supabase.rpc(
        "decrement_product_stock",
        {
          p_product_id: item.id,
          p_quantity: item.quantity,
        }
      );

      if (stockError) {
        console.error("❌ Stock update failed for product:", item.id, stockError);
        return res.status(500).send("Stock update failed");
      }

      console.log(`📉 Stock reduced for product ${item.id} by ${item.quantity}`);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Webhook failed");
  }
});

/* ===================================================
   DEBUG ROUTE
   =================================================== */
app.get("/debug-product/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("id", id);

  console.log("🔍 DEBUG data:", data);
  console.log("🔍 DEBUG error:", error);

  return res.json({ data, error });
});

/* ===================================================
   3️⃣ DOWNLOAD INVOICE
   =================================================== */
app.get("/download-invoice/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, created_at")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const year = new Date(order.created_at).getFullYear();
    const invoiceNumber = `INV-${year}-${order.id.slice(0, 6)}`;

    const invoicePath = path.join(
      process.cwd(),
      "invoices",
      `${invoiceNumber}.pdf`
    );

    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.download(invoicePath, `${invoiceNumber}.pdf`);
  } catch (err) {
    console.error("❌ Invoice download error:", err);
    res.status(500).json({ error: "Failed to download invoice" });
  }
});

/* ===================================================
   CONTACT FORM
   =================================================== */
app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await transporter.sendMail({
      from: `"Ajashia Tech Store (Contact Form)" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: `"${name}" <${email}>`,
      subject: `📬 ${name} says: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h2 style="color: #813FF1; margin-top: 0;">New Contact Form Message</h2>
          <div style="background: #1e293b; border-left: 3px solid #813FF1; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">From</p>
            <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600;">${name}</p>
            <p style="margin: 2px 0 0; font-size: 13px; color: #813FF1;">${email}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; width: 80px; vertical-align: top;">Subject</td>
              <td style="padding: 8px 0; font-weight: 600;">${subject}</td>
            </tr>
          </table>
          <hr style="border-color: #1e293b; margin: 20px 0;" />
          <p style="color: #94a3b8; margin: 0 0 8px; font-size: 13px;">Message</p>
          <p style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 0; line-height: 1.7;">${message.replace(/\n/g, "<br/>")}</p>
          <div style="margin-top: 24px; padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;">
            <p style="margin: 0; color: #475569; font-size: 12px;">💡 Hit <strong style="color: #94a3b8;">Reply</strong> in Gmail to respond directly to ${name} at ${email}</p>
          </div>
          <p style="color: #334155; font-size: 11px; margin-top: 16px;">Sent via Ajashia Tech Store contact form</p>
        </div>
      `,
    });

    console.log(`📬 Contact form email received from ${name} <${email}>`);
    return res.json({ success: true });
  } catch (err) {
    console.error("Contact form email error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

/* ===================================================
   NEWSLETTER — SUBSCRIBE
   =================================================== */
app.post("/newsletter/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, subscribed: true }, { onConflict: "email" });

  if (error) {
    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({ error: "Failed to subscribe" });
  }

  try {
    await transporter.sendMail({
      from: `"Ajashia Tech Store" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "You're subscribed to Ajashia Tech Store!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e2e8f0; padding: 32px; border-radius: 12px;">
          <h2 style="color: #813FF1; margin-top: 0;">Welcome to Ajashia Tech Store!</h2>
          <p style="color: #94a3b8; line-height: 1.7;">Thanks for subscribing! You'll be the first to know about new products, tutorials, and exclusive offers.</p>
          <p style="color: #94a3b8; line-height: 1.7;">Whether it's your next IoT build, Arduino project, or just geeking out over new components — you'll hear about it here first. Welcome to the community! ⚡</p>
          <hr style="border-color: #1e293b; margin: 24px 0;" />
          <p style="color: #475569; font-size: 12px;">
            Don't want to receive emails?
            <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #813FF1;">Unsubscribe here</a>
          </p>
        </div>
      `,
    });
  } catch (mailErr) {
    console.error("Welcome email error:", mailErr);
  }

  console.log(`Newsletter: new subscriber ${email}`);
  return res.json({ success: true });
});

/* ===================================================
   NEWSLETTER — UNSUBSCRIBE
   =================================================== */
app.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ subscribed: false })
    .eq("email", email);

  if (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }

  console.log(`Newsletter: unsubscribed ${email}`);
  return res.json({ success: true });
});

/* ===================================================
   NEWSLETTER — SEND (Admin only)
   =================================================== */
app.post("/newsletter/send", async (req, res) => {
  const { subject, html } = req.body;

  if (!subject || !html) {
    return res.status(400).json({ error: "Subject and content are required" });
  }

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("subscribed", true);

  if (error || !subscribers || subscribers.length === 0) {
    return res.status(400).json({ error: "No active subscribers found" });
  }

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from: `"Ajashia Tech Store" <${process.env.GMAIL_USER}>`,
        to: sub.email,
        subject,
        html: html + `
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 12px; color: #475569; font-family: sans-serif;">
            You're receiving this because you subscribed to Ajashia Tech Store updates.<br/>
            <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color: #813FF1;">Unsubscribe</a>
          </div>`,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${sub.email}:`, err);
      failed++;
    }
  }

  console.log(`Newsletter sent: ${sent} success, ${failed} failed`);
  return res.json({ success: true, sent, failed, total: subscribers.length });
});

/* ===================================================
   NEWSLETTER — STATS (Admin)
   =================================================== */
app.get("/newsletter/stats", async (req, res) => {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("subscribed");

  if (error) return res.status(500).json({ error: "Failed to fetch stats" });

  const total = data.length;
  const active = data.filter((s) => s.subscribed).length;
  const unsubscribed = total - active;

  return res.json({ total, active, unsubscribed });
});


/* ===================================================
   COUPON — VALIDATE
   =================================================== */
app.post("/coupon/validate", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("code, discount_percent, is_active, expires_at")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (error || !coupon) return res.status(404).json({ error: "Invalid coupon code" });
  if (!coupon.is_active) return res.status(400).json({ error: "This coupon is no longer active" });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return res.status(400).json({ error: "This coupon has expired" });
  }

  return res.json({ code: coupon.code, discount_percent: coupon.discount_percent });
});

/* ===================================================
   SEYAL DNA — ROUTES
   =================================================== */

// Get DNA relationships for a product
app.get("/dna/:productId", async (req, res) => {
  const { productId } = req.params;
  const { data, error } = await supabase
    .from("component_dna")
    .select(`id, relationship_type, reason, sort_order,
      related_product:products!component_dna_related_product_id_fkey(id,name,price,offer_price,image_url,slug,stock)`)
    .eq("product_id", productId)
    .order("sort_order");
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Add DNA relationship
app.post("/dna", async (req, res) => {
  const { product_id, related_product_id, relationship_type, reason, sort_order } = req.body;
  if (!product_id || !related_product_id || !relationship_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const { data, error } = await supabase.from("component_dna").insert({
    product_id, related_product_id, relationship_type,
    reason: reason || null,
    sort_order: sort_order || 0,
  }).select().single();
  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "This relationship already exists" });
    return res.status(500).json({ error: error.message });
  }
  return res.json(data);
});

// Delete DNA relationship
app.delete("/dna/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("component_dna").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// Get all projects
app.get("/projects", async (req, res) => {
  const { data: projs, error } = await supabase
    .from("product_projects").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const enriched = await Promise.all(projs.map(async (proj) => {
    const { data: comps } = await supabase
      .from("project_components")
      .select(`id, is_required, quantity, product:products(id,name,image_url,price,offer_price,slug,stock)`)
      .eq("project_id", proj.id);
    return { ...proj, name: proj.project_name, components: comps || [] };
  }));
  return res.json(enriched);
});

// Create project
app.post("/projects", async (req, res) => {
  const { name, description, difficulty, youtube_query } = req.body;
  if (!name || !difficulty) return res.status(400).json({ error: "Name and difficulty required" });
  const { data, error } = await supabase.from("product_projects").insert({
    project_name: name, description: description || null, difficulty, youtube_query: youtube_query || null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Delete project
app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("product_projects").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// Add component to project
app.post("/projects/:projectId/components", async (req, res) => {
  const { projectId } = req.params;
  const { product_id, is_required, quantity } = req.body;
  if (!product_id) return res.status(400).json({ error: "product_id required" });
  const { data, error } = await supabase.from("project_components").insert({
    project_id: projectId, product_id,
    is_required: is_required ?? true,
    quantity: quantity || 1,
  }).select().single();
  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Already added to this project" });
    return res.status(500).json({ error: error.message });
  }
  return res.json(data);
});

// Remove component from project
app.delete("/projects/components/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("project_components").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

/* ===================================================  */

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});