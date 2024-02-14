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
    recipientEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientStatements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
