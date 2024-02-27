const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["event", "statement", "service", "private"],
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    recipientEvent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    recipientService: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    recipientUser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientStatement: [{ type: mongoose.Schema.Types.ObjectId, ref: "Statement" }],
    city: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
    neighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;

