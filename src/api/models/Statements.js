const mongoose = require("mongoose");

const statementsSchema = new mongoose.Schema(
  {
    tituloServicio: {
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
    recipientComents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coment" }],
    recipientLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientNeighborhood: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
  },
  {
    timestamps: true,
  }
);

const statements = mongoose.model("Statements", statementsSchema);

module.exports = statements;
