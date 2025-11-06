// controllers/addressController.js

import Address from "../model/addressModel.js"; // ✅ ensure model path sahi ho

// ➕ Add new address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware se milta hai
    const { label, addressLine, city, state, pincode, phone } = req.body;

    const newAddress = new Address({
      userId,
      label,
      addressLine,
      city,
      state,
      pincode,
      phone,
    });

    await newAddress.save();
    res.status(201).json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Failed to add address" });
  }
};

// 📋 Get all user addresses
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

// ❌ Delete specific address
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Failed to delete address" });
  }
};
