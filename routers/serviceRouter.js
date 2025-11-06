import express from "express";
import {
  getAllServices,
  addService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

// Customer/User
router.get("/", getAllServices);

// Admin
router.post("/add", addService);
router.put("/update/:id", updateService);
router.delete("/delete/:id", deleteService);

export default router;
