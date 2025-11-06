import { Order } from "../model/orderModel.js";
import { instance } from "../index.js"; // Razorpay instance

// 🆕 Create New Order with Razorpay Integration
export const createOrder = async (req, res) => {
  try {
    // 🔹 Customer details from JWT
    const customerId = req.user.id;

    // 🔹 Data from request body
    const {
      services,
      address,
      subtotal,
      offerCode,
      discount,
      totalAmount,
      paymentMode,
      notes,
      pickupTime,
      customerPhone,
      deliveryWithin, // ✅ Added here
    } = req.body;

    // 🔹 Validation
    if (!pickupTime || !address || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "pickupTime, address, and customerPhone are required",
      });
    }

    // 🔹 Validate address fields
    if (!address.line1?.trim() || !address.city?.trim() || !address.pincode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Address must include line1, city, and pincode",
      });
    }

    // 🔹 Validate services array
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Services must be a non-empty array",
      });
    }
    for (const service of services) {
      if (!service.name || !service.qty || !service.price) {
        return res.status(400).json({
          success: false,
          message: "Each service must have name, qty, and price",
        });
      }
    }

    // 🔹 Validate pickupTime
    const pickupDate = new Date(pickupTime);
    if (isNaN(pickupDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickupTime format",
      });
    }

    // 🔹 Step 1: Create Razorpay Order only if payment mode is Razorpay
    let razorpayOrder = null;
    if (paymentMode === "Razorpay") {
      const options = {
        amount: Math.round(totalAmount * 100), // convert ₹ to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      razorpayOrder = await instance.orders.create(options);
    }

    // 🔹 Step 2: Save order in MongoDB
    const order = new Order({
      customerId,
      customerPhone,
      address,
      services,
      subtotal,
      offerCode: offerCode || null,
      discount: discount || 0,
      totalAmount,
      paymentMode: paymentMode || "Razorpay",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
      razorpayOrderId: razorpayOrder?.id || null,
      notes: notes || "",
      pickupTime: pickupDate,
      deliveryWithin: deliveryWithin || "24 hours", // ✅ Added this line
      deliveryTime: null,
      trackingId: `TLR-DEL-${Math.floor(Math.random() * 10000)}`,
    });

    await order.save();

    // 🔹 Step 3: Respond with details
    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: {
        _id: order._id,
        razorpayOrderId: order.razorpayOrderId,
        totalAmount: order.totalAmount,
        discount: order.discount,
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        services: order.services,
        address: order.address,
        contactNumber: order.customerPhone,
        offerCode: order.offerCode,
        notes: order.notes,
        pickupTime: order.pickupTime,
        deliveryWithin: order.deliveryWithin, // ✅ Added this line
        deliveryTime: order.deliveryTime,
        trackingId: order.trackingId,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message || error,
    });
  }
};

// 🧾 Update Payment Status (After Razorpay Success)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;
    const order = await Order.findById(orderId);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.paymentStatus = paymentStatus;
    order.orderStatus =
      paymentStatus === "Paid" ? "Confirmed" : order.orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error,
    });
  }
};

// 🧍‍♂️ Get All Orders for Logged-in Customer
export const getOrdersByCustomer = async (req, res) => {
  try {
    const customerId = req.user.id;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error,
    });
  }
};

// 🔍 Get Single Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error,
    });
  }
};

// 🚚 Update Order Status (Pending → In-Progress → Ready → Delivered)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error,
    });
  }
};

// 🧾 Admin - Get All Orders
export const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching all orders",
      error,
    });
  }
};
