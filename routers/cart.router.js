import express from "express";
import { saveCart, markPaid, getCart, getCartCount, clearCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/save", saveCart);
router.get("/:userId", getCart);
router.post("/markPaid", markPaid);
router.get("/count/:userId", getCartCount);
router.post("/clear", clearCart);

export default router;
