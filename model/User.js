import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },

  // New fields for Users Management
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan" },
  subscriptionStatus: { type: String, enum: ["active", "inactive"], default: "inactive" },
  appliedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Offer" }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

  // ======= OTP / Verification Fields =======
  otp: { type: String },                        // Temporary OTP storage
  otpExpires: { type: Date },                   // OTP expiry timestamp
  isVerified: { type: Boolean, default: false } // True after OTP verified
}, { timestamps: true });

export default mongoose.model("User", userSchema);
