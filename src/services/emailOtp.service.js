import bcrypt from "bcrypt";
import { EmailOtp } from "../models/emailOtp.model.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createEmailOtp = async (userId, otp) => {
  const otpHash = await bcrypt.hash(otp, 10);

  // delete any old OTPs
  await EmailOtp.deleteMany({ user: userId });

  return EmailOtp.create({
    user: userId,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });
};

export const verifyEmailOtp = async (userId, otp) => {
  const record = await EmailOtp.findOne({ user: userId });

  if (!record) return false;
  if (Date.now() > record.expiresAt) return false;

  record.attempts += 1;
  await record.save();

  if (record.attempts > 5) {
    await EmailOtp.deleteOne({ _id: record._id });
    return false;
  }

  return bcrypt.compare(otp, record.otpHash);
};
