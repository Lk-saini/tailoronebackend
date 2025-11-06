// routers/subscription.router.js
import express from "express";
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  buySubscription,
  getUserSubscriptions,
  updateClothUsage,
} from "../controllers/subscription.controller.js";

const router = express.Router();

// ✅ Admin Routes
router.get("/", getSubscriptions); // Get all active subscriptions
router.post("/", addSubscription); // Add a subscription
router.put("/:id", updateSubscription); // Update subscription by ID
router.delete("/:id", deleteSubscription); // Delete subscription by ID

// ✅ User Routes
router.post("/buy", buySubscription); // User buys a subscription
router.get("/user/:userId", getUserSubscriptions); // Get all subscriptions of a user
router.put("/usage/:userSubscriptionId", updateClothUsage); // Update cloth usage for a user's subscription

export default router;
