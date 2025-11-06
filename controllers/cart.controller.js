import { Cart } from "../model/cartModel.js";

// 🛒 Add or update cart
export const saveCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = items;
      cart.total = total;
    } else {
      cart = new Cart({ userId, items, total });
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving cart", error });
  }
};

// ✅ Get current user cart (for OrderPage prefill)
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart", error });
  }
};

// 💰 Update payment status after successful Razorpay verification
export const markPaid = async (req, res) => {
  try {
    const { userId, paymentId } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.paymentStatus = "Paid";
    await cart.save();

    res.status(200).json({ success: true, message: "Payment marked as paid", paymentId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Payment update failed", error });
  }
};

// 🧮 Get cart item count
export const getCartCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    const count = cart ? cart.items.length : 0;
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ count: 0 });
  }
};

// 🗑️ Clear cart after successful order placement
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    await Cart.deleteOne({ userId });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to clear cart", error });
  }
};
