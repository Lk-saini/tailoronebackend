import nodemailer from "nodemailer";
import sendinBlueTransport from "nodemailer-sendinblue-transport";

export const sendOtp = async (email, otp) => {
  try {
    // 🔹 Brevo transporter setup
    const transporter = nodemailer.createTransport(
      new sendinBlueTransport({
        apiKey: "your_brevo_api_key", // ⬅️ Yahan apni Brevo API key daalo
      })
    );

    // 🔹 Email details
    const mailOptions = {
      from: "manishnagar80828@gmail.com", // Brevo verified sender email
      to: email,
      subject: "Your OTP Code - TailorOne",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>TailorOne OTP Verification</h2>
          <p>Dear User,</p>
          <p>Your OTP code is: <b>${otp}</b></p>
          <p>This code will expire in 5 minutes.</p>
          <br />
          <p>Best regards,<br/>TailorOne Team</p>
        </div>
      `,
    };

    // 🔹 Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent via Brevo!");
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
  }
};
