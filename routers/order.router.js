import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";
import {
  createOrder,
  updatePaymentStatus,
  getOrdersByCustomer,
  getOrderById,
  updateOrderStatus,
  getAllOrdersForAdmin,
} from "../controllers/order.controller.js";

const router = express.Router();

/**
 * 🆕 Create new order
 * POST /api/orders/create
 * (User - login required)
 */
router.post("/create", authMiddleware, createOrder);

/**
 * 💳 Update Payment Status (COD / Razorpay)
 * PUT /api/orders/update-payment
 * (User - login required)
 */
router.put("/update-payment", authMiddleware, updatePaymentStatus);

/**
 * 📦 Get all orders of logged-in customer
 * GET /api/orders/my-orders
 * (User - login required)
 */
router.get("/my-orders", authMiddleware, getOrdersByCustomer);

/**
 * 🧾 Admin - Get All Orders
 * GET /api/orders/all
 * (Admin only)
 */
router.get("/all", authMiddleware, adminMiddleware, getAllOrdersForAdmin);

/**
 * 🔍 Get single order by ID
 * GET /api/orders/:orderId
 * (User/Admin - login required)
 */
router.get("/:orderId", authMiddleware, getOrderById);

/**
 * 🚚 Update Order Status (Pending → In-Progress → Ready → Delivered)
 * PUT /api/orders/update-status/:orderId
 * (Admin - login required)
 */
router.put("/update-status/:orderId", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
