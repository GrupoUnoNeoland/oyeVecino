const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["public", "private"],
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
    stars: {
      type: Number,
    },
    recipientEvent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipientService: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipientStatement: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
