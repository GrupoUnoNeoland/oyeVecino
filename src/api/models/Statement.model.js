const mongoose = require("mongoose");

const statementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
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
    recipientComments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    ],
    recipientLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientNeighborhoods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
  },
  {
    timestamps: true,
  }
);

const Statement = mongoose.model("Statement", statementSchema);

module.exports = Statement;
