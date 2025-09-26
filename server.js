// server.js (complete, ESM)
import dotenv from "dotenv";
dotenv.config(); // MUST run before using process.env

import express from "express";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in .env — open .env and add it.");
  process.exit(1);
}

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });

app.use(express.json());
app.use(express.static(".")); // serve index.html and success/cancel pages

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Support My Portfolio" },
          unit_amount: 500,
        },
        quantity: 1,
      }],
      success_url: "http://localhost:4242/success.html",
      cancel_url: "http://localhost:4242/cancel.html",
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log("Server running on http://localhost:4242"));