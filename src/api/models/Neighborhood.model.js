const { mongoose } = require("mongoose");

const NeighborhoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
    unique: true,
  },
  city: [{ type: mongoose.Schema.ObjectId, ref: "City" }],
  requests: [{ type: mongoose.Schema.ObjectId, ref: "Request" }],
  users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  services: [{ type: mongoose.Schema.ObjectId, ref: "Service" }],
  events: [{ type: mongoose.Schema.ObjectId, ref: "Event" }],
  statements: [{ type: mongoose.Schema.ObjectId, ref: "Statement" }],
  neighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
});

const Neighborhood = mongoose.model("Neighborhood", NeighborhoodSchema);
module.exports = Neighborhood;
