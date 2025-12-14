import mongoose, { Schema, model } from "mongoose";

const emailOtpSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/*
 Optional but powerful:
 MongoDB will AUTO-DELETE the document after expiry.
*/
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailOtp = model("EmailOtp", emailOtpSchema);
