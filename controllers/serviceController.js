import Service from "../model/serviceModel.js";

// ✅ Add new service
export const addService = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const service = new Service({
      name,
      description,
      price,
    });

    await service.save();

    res.status(201).json({
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    console.error("Error adding service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    const updated = await Service.findByIdAndUpdate(
      id,
      { name, description, price },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
