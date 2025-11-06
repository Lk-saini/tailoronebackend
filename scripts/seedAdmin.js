import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../model/User.js";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
  const plainPassword = process.env.ADMIN_PASSWORD;

  const hashed = await bcrypt.hash(plainPassword, 10);

  const existing = await User.findOne({ email });

  if (existing) {
    // ✅ Existing user ko admin me convert kar do
    existing.role = "admin";
    existing.password = hashed; // password bhi update
    existing.isVerified = true;
    await existing.save();
    console.log("Existing user updated to admin:", email);
  } else {
    const admin = new User({
      name,
      email,
      password: hashed,
      role: "admin",
      isVerified: true
    });
    await admin.save();
    console.log("Admin created:", email);
  }

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
