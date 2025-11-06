import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🔹 Customer Info
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerPhone: { type: String, required: true },

    // 🔹 Address Object (Updated)
    address: {
      houseNo: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String, default: "" },
      line1: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // 🔹 Services List
    services: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    // 🔹 Pricing & Offer Details
    subtotal: { type: Number, required: true },
    offerCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // 🔹 Payment Info
    paymentMode: {
      type: String,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: function () {
        return this.paymentMode === "COD" ? "Unpaid" : "Unpaid";
      },
    },
    razorpayOrderId: { type: String, default: null },

    // 🔹 COD Specific Fields
    codConfirmed: {
      type: Boolean,
      default: function () {
        return this.paymentMode === "COD";
      },
    },
    codOtp: { type: String, default: null },

    // 🔹 Delivery Timeframe (Customer-selected)
    deliveryWithin: {
      type: String,
      enum: ["12 hours", "24 hours", "48 hours", "72 hours"],
      default: "24 hours",
      required: true,
    },

    // 🔹 Order Status Flow
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "In-Progress",
        "Ready",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // 🔹 Delivery Info (admin handled)
    pickupTime: { type: Date, required: true },
    deliveryTime: { type: Date, default: null },
    trackingId: {
      type: String,
      default: function () {
        return `TLR-${Math.floor(100000 + Math.random() * 900000)}`;
      },
    },

    // 🔹 Extra Notes
    notes: { type: String, default: "" },

    // 🔹 Admin Remarks
    adminRemarks: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
