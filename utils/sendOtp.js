// utils/sendOtp.js
import nodemailer from "nodemailer";

export const sendOtp = async (email, otp) => {
  try {
    // Gmail transporter setup
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "manishnagar80828@gmail.com",       // Yaha apna Gmail daalo
        pass: "jshk ijdl xnun nxrg"          // Gmail app password daalo
      }
    });

    const mailOptions = {
      from: '"TailorOne 👕" <manishnagar80828@gmail.com>',
      to: email,
      subject: "Your OTP for TailorOne",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
  } catch (err) {
    console.log("Error sending OTP:", err.message);
  }
};
