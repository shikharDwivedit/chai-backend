import mongoose, { Schema, model } from "mongoose";

const ReportSchema = new Schema(
  {
    targetType: {
      type: String,
      enum: ["Video", "Comment"],
      required: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Report = model("Report", ReportSchema);