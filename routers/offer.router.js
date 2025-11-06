import express from "express";
import { 
  getOffers, 
  addOffer, 
  getOfferByCode, 
  updateOffer, 
  deleteOffer 
} from "../controllers/offer.controller.js";

const router = express.Router();

router.get("/", getOffers);                     // Get all offers
router.post("/", addOffer);                     // Add a new offer
router.get("/code/:code", getOfferByCode);     // Get offer by code
router.put("/:id", updateOffer);               // Update offer by ID
router.delete("/:id", deleteOffer);            // Delete offer by ID

export default router;
