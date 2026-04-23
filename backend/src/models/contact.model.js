const mongoose = require("mongoose");

const normalizePhoneNumber = require("../utils/normalizePhoneNumber");

const contactSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ["manual", "csv", "excel"],
      default: "manual",
    },
    lastMessagedAt: {
      type: Date,
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

contactSchema.index({ owner: 1, normalizedPhoneNumber: 1 }, { unique: true });

contactSchema.pre("validate", function normalizeContactPhone() {
  this.normalizedPhoneNumber = normalizePhoneNumber(this.phoneNumber, this.countryCode);
});

module.exports = mongoose.model("Contact", contactSchema);
