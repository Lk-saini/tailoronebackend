import cors from "cors";
import express from "express";
import paymentRouter from "./routers/payment.router.js";
import cartRouter from "./routers/cart.router.js";
import offerRouter from "./routers/offer.router.js";
import subscriptionRouter from "./routers/subscription.router.js";
import authRoutes from "./routers/authRoutes.js";
import orderRouter from "./routers/order.router.js";
import serviceRouter from "./routers/serviceRouter.js"; // ✅ Added
import addressRouter from "./routers/addressRouter.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

// Payment routes
app.use("/api", paymentRouter);

// Cart routes
app.use("/api/cart", cartRouter);

// Offers routes
app.use("/api/offers", offerRouter);

// Subscription routes
app.use("/api/subscriptions", subscriptionRouter);

app.use("/api/orders", orderRouter);

// ✅ Service routes
app.use("/api/services", serviceRouter);

app.use("/api/address", addressRouter);


// Get Razorpay key
app.get("/api/getkey", (req, res) => {
  res.status(200).json({
    keyId: process.env.KEY_ID,
  });
});

export default app;
