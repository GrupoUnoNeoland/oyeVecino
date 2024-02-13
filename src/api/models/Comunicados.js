const mongoose = require("mongoose");

const ComunicadosSchema = new mongoose.Schema(
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
    recipientComent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientBarrio: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Comunicados = mongoose.model("Comunicados", ComunicadosSchema);

module.exports = Comunicados;
