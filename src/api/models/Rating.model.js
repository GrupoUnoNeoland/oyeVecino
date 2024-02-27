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
    city: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
    neighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", RatingSchema);
module.exports = Rating;
