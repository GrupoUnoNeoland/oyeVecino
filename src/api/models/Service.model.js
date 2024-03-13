const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["offered", "demanded"],
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
    provider: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    neighborhoods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
    starReview: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;
