// controllers/subscription.controller.js
import { Subscription } from "../model/Subscription.js";
import { UserSubscription } from "../model/UserSubscription.js";
import mongoose from "mongoose";

// ✅ Admin: Get all active subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ active: true });
    res.status(200).json({ success: true, subscriptions: subs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Admin: Add a new subscription
export const addSubscription = async (req, res) => {
  try {
    const newSub = new Subscription(req.body);
    await newSub.save();
    res.status(201).json({ success: true, subscription: newSub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Admin: Update subscription
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSub = await Subscription.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSub)
      return res.status(404).json({ success: false, message: "Subscription not found" });
    res.status(200).json({ success: true, subscription: updatedSub });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Admin: Delete subscription
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSub = await Subscription.findByIdAndDelete(id);
    if (!deletedSub)
      return res.status(404).json({ success: false, message: "Subscription not found" });
    res.status(200).json({ success: true, message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ User: Buy a subscription
export const buySubscription = async (req, res) => {
  try {
    const { userId, subscriptionId } = req.body;

    // Validate IDs
    if (!userId || !subscriptionId)
      return res.status(400).json({ success: false, message: "userId and subscriptionId are required" });

    if (!mongoose.Types.ObjectId.isValid(subscriptionId))
      return res.status(400).json({ success: false, message: "Invalid subscription ID" });

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription)
      return res.status(404).json({ success: false, message: "Subscription not found" });

    // Ensure required fields exist
    const durationDays = subscription.durationDays || 30; // default 30 days
    const clothLimit = subscription.clothLimit || 0;

    const now = new Date();
    const userSub = new UserSubscription({
      userId,
      subscriptionId,
      startDate: now,
      expiryDate: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
      clothLimit,
      clothUsed: 0,
      status: "active",
    });

    await userSub.save();
    res.status(201).json({ success: true, userSubscription: userSub });
  } catch (error) {
    console.error("Error in buySubscription:", error); // detailed logging
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ User: Get all subscriptions bought by a user
export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ success: false, message: "userId is required" });

    const userSubs = await UserSubscription.find({ userId }).populate("subscriptionId");
    res.status(200).json({ success: true, subscriptions: userSubs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update cloth usage for a user subscription and handle expiry
export const updateClothUsage = async (req, res) => {
  try {
    const { userSubscriptionId } = req.params;
    const { used } = req.body; // number of clothes used in this transaction

    if (!mongoose.Types.ObjectId.isValid(userSubscriptionId))
      return res.status(400).json({ success: false, message: "Invalid userSubscriptionId" });

    const userSub = await UserSubscription.findById(userSubscriptionId).populate("subscriptionId");
    if (!userSub)
      return res.status(404).json({ success: false, message: "User subscription not found" });

    // Update cloth usage
    userSub.clothUsed += used || 0;

    // Handle subscription expiry
    const now = new Date();
    if (userSub.clothUsed >= userSub.clothLimit || now >= new Date(userSub.expiryDate)) {
      userSub.status = "expired";
      userSub.active = false;
    }

    await userSub.save();
    res.status(200).json({ success: true, userSubscription: userSub });
  } catch (error) {
    console.error("Error in updateClothUsage:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
