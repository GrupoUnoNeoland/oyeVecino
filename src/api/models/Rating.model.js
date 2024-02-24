const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const RatingSchema = new Schema(
  {
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userServiceProvider: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    userServiceTaker: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    service: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
  },
  { timestamps: true }
);

// Create Company model
const Rating = mongoose.model("Rating", RatingSchema);
module.exports = Rating;
