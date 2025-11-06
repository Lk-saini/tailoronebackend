import express from "express";
import { addAddress, getUserAddresses, deleteAddress } from "../controllers/addressController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ➕ Add new address
router.post("/", authMiddleware, addAddress);

// 📋 Get all user addresses
router.get("/", authMiddleware, getUserAddresses);

// ❌ Delete specific address
router.delete("/:id", authMiddleware, deleteAddress);

export default router; // ✅ Important
