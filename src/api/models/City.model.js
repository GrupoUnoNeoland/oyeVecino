const mongoose = require("mongoose");

const CitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    neighborhoods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
  },
  {
    timestamps: true,
  }
);

const City = mongoose.model("City", CitySchema);

module.exports = City;
