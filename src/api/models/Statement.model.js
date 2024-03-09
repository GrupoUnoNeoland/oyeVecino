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
    city: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    owner: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
