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
    },
    user: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },

    neighborhood: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", RequestSchema);

module.exports = Request;
