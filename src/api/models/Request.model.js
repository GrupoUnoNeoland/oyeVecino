const { mongoose } = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    document: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: ["rejected", "accepted", "waiting"],
      default: "waiting",
    },
    city: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    neighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", RequestSchema);

module.exports = Request;
