import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Silver Plan
  price: { type: Number, required: true }, // e.g. 499
  durationDays: { type: Number, required: true }, // e.g. 30 (validity in days)
  benefits: { type: [String] }, // e.g. ["Free pickup", "Priority service"]
  active: { type: Boolean, default: true },

  // 👇 New Fields Added
  clothLimit: { type: Number, required: true }, // e.g. 40 clothes allowed per plan
  startDate: { type: Date, default: null }, // when user activates subscription
  endDate: { type: Date, default: null }, // auto calculated when user subscribes

  // tracking usage
  usedClothCount: { type: Number, default: 0 }, // track how many clothes are used
  remainingClothCount: { type: Number, default: function() { return this.clothLimit; } },

  // auto-expiry flags
  isExpired: { type: Boolean, default: false },
}, { timestamps: true });

/**
 * Method to check if subscription should expire automatically
 * based on date or cloth usage
 */
subscriptionSchema.methods.checkExpiry = function () {
  const now = new Date();
  if (
    (this.endDate && now > this.endDate) ||
    (this.usedClothCount >= this.clothLimit)
  ) {
    this.isExpired = true;
    this.active = false;
  }
  return this.isExpired;
};

/**
 * Method to activate a new subscription (like recharge)
 * Automatically sets start & end date
 */
subscriptionSchema.methods.activate = function () {
  const now = new Date();
  this.startDate = now;
  this.endDate = new Date(now.getTime() + this.durationDays * 24 * 60 * 60 * 1000);
  this.usedClothCount = 0;
  this.remainingClothCount = this.clothLimit;
  this.active = true;
  this.isExpired = false;
};

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
