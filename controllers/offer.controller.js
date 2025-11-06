import { Offer } from "../model/Offer.js";

// Get all active offers
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ active: true });
    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add a new offer
export const addOffer = async (req, res) => {
  try {
    const { title, code, discount, discountPercent, validTill } = req.body;

    // Validation
    if (!title || !code || !validTill) {
      return res.status(400).json({ success: false, message: "Title, code, and validTill are required." });
    }
    if (discount === null && discountPercent === null) {
      return res.status(400).json({ success: false, message: "Either discount or discountPercent must be provided." });
    }

    const existingOffer = await Offer.findOne({ code });
    if (existingOffer) {
      return res.status(400).json({ success: false, message: "Offer code already exists." });
    }

    const newOffer = new Offer(req.body);
    await newOffer.save();

    res.status(201).json({ success: true, offer: newOffer });
  } catch (error) {
    console.error("Error adding offer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get offer by code
export const getOfferByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const offer = await Offer.findOne({ code: code, active: true });

    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.status(200).json({ success: true, offer });
  } catch (error) {
    console.error("Error fetching offer by code:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update an offer by ID
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure at least one discount exists
    if (updateData.discount === null && updateData.discountPercent === null) {
      return res.status(400).json({ success: false, message: "Either discount or discountPercent must be provided." });
    }

    // Check for duplicate code only if code is being updated
    if (updateData.code) {
      const existingOfferWithCode = await Offer.findOne({ 
        code: updateData.code, 
        _id: { $ne: id } 
      });
      if (existingOfferWithCode) {
        return res.status(400).json({ success: false, message: "Another offer with the same code exists." });
      }
    }

    const updatedOffer = await Offer.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOffer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.status(200).json({ success: true, offer: updatedOffer });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete an offer by ID
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);

    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.status(200).json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
