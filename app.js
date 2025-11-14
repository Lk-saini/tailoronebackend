import cors from "cors";
import express from "express";
import paymentRouter from "./routers/payment.router.js";
import cartRouter from "./routers/cart.router.js";
import offerRouter from "./routers/offer.router.js";
import subscriptionRouter from "./routers/subscription.router.js";
import authRoutes from "./routers/authRoutes.js";
import orderRouter from "./routers/order.router.js";
import serviceRouter from "./routers/serviceRouter.js";
import addressRouter from "./routers/addressRouter.js";

const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",     // for local development
  "https://tailorone.co.in",
   "http://localhost:5173/"// your live frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", paymentRouter);
app.use("/api/cart", cartRouter);
app.use("/api/offers", offerRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/orders", orderRouter);
app.use("/api/services", serviceRouter);
app.use("/api/address", addressRouter);

// Razorpay key route
app.get("/api/getkey", (req, res) => {
  res.status(200).json({ keyId: process.env.KEY_ID });
});

export default app;
