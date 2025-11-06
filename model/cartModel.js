import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [cartItemSchema],
  total: Number,
  paymentStatus: {
    type: String,
    default: "Pending",
  },
});

export const Cart = mongoose.model("Cart", cartSchema);
