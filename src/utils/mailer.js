import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <p>Your OTP is <b>${otp}</b></p>
      <p>This OTP is valid for 5 minutes.</p>
    `
  });
};
