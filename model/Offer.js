import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  discount: { type: Number, default: null },          // Flat discount in ₹
  discountPercent: { type: Number, default: null },   // Percentage discount %
  minAmount: { type: Number, default: 0 },           // Minimum cart amount
  description: { type: String, default: "" },        // Offer description
  validTill: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

// Add a custom validation to ensure at least one discount exists
offerSchema.pre("save", function (next) {
  if (this.discount === null && this.discountPercent === null) {
    return next(new Error("Either discount or discountPercent must be provided."));
  }
  next();
});

export const Offer = mongoose.model("Offer", offerSchema);
