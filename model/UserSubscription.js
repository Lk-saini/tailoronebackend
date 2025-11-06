// models/UserSubscription.js
import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },

  startDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date, required: true }, // automatically calculated from startDate + durationDays
  clothLimit: { type: Number, required: true }, // total clothes allowed in this subscription
  clothUsed: { type: Number, default: 0 }, // number of clothes used so far

  status: { 
    type: String, 
    enum: ["active", "expired"], 
    default: "active" 
  },
  autoRenew: { type: Boolean, default: false }, // optional for future feature

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to automatically calculate expiryDate from subscription duration
userSubscriptionSchema.pre("save", async function(next) {
  if (!this.expiryDate) {
    // Get subscription duration from linked subscription
    const Subscription = mongoose.model("Subscription");
    const sub = await Subscription.findById(this.subscriptionId);
    if (sub) {
      this.expiryDate = new Date(this.startDate.getTime() + sub.durationDays * 24 * 60 * 60 * 1000);
      this.clothLimit = sub.clothLimit || 0; // set cloth limit from subscription
    }
  }
  next();
});

export const UserSubscription = mongoose.model("UserSubscription", userSubscriptionSchema);
