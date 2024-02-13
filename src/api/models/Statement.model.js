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

    images: [
      {
        type: String,
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    neighborhoods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
  },
  {
    timestamps: true,
  }
);

const Statement = mongoose.model("Statement", statementSchema);

module.exports = Statement;
