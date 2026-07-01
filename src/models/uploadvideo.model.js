import mongoose, { Schema, model } from "mongoose";

const uploadVideoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    uploadId: {
      type: String,
      required: true,
      unique: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["INIT", "PARTIAL", "READY", "FAILED", "ABANDONED"],
      default: "INIT",
    },
    assets: {
      video: {
        publicId: {
          type: String,
          required: true,
        },
        secureUrl: {
          type: String,
        },
        playbackUrl: {
          type: String,
        },
        uploaded: {
          type: Boolean,
          default: false,
        },
        duration:{
            type:Number
        }
      },
      thumbnail: {
        publicId: {
          type: String,
          required: true,
        },
        secureUrl: {
          type: String,
        },
        uploaded: {
          type: Boolean,
          default: false,
        },
      },
    },
    callbackReceived: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired upload documents
uploadVideoSchema.index(
  { expiresAt: 1 }, 
  { expireAfterSeconds: 0 }
);

export const UploadVideo = model("UploadVideo", uploadVideoSchema);