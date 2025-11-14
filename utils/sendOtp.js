import nodemailer from "nodemailer";

export const sendOtp = async (email, otp) => {
  try {
    // Brevo SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: "manishnagar80828@gmail.com",   // Brevo login email
        pass: "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",            // Brevo SMTP key
      },
    });

    // Email content
    const mailOptions = {
      from: "manishnagar80828@gmail.com",
      to: email,
      subject: "Your OTP Code - TailorOne",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>TailorOne OTP Verification</h2>
          <p>Your OTP code is: <b>${otp}</b></p>
          <p>This code expires in <b>5 minutes</b>.</p>
          <br/>
          <p>Best regards,<br/>TailorOne Team</p>
        </div>
      `,
    };

    // Send mail
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent via Brevo!");
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
  }
};
