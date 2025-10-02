// Only load .env in development (not in Vercel production)
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import express from "express";
import Stripe from "stripe";

// Check if Stripe secret key is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in environment variables.");
  process.exit(1);
}

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

app.use(express.json());
app.use(express.static("."));

// Create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Support My Portfolio" },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      success_url:
        "https://stalwart-otter-d134a8.netlify.app/success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        "https://stalwart-otter-d134a8.netlify.app/cancel.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to check session status
app.get("/session_status", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );
    res.json({
      status: session.payment_status,
      amount_total: session.amount_total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic port for Render or local dev
const PORT = process.env.PORT || 4242;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
