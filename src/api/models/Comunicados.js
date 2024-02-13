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
    recipientComents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coment" }],
    recipientLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientBarrios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Barrio" }],
  },
  {
    timestamps: true,
  }
);

const Comunicados = mongoose.model("Comunicados", ComunicadosSchema);

module.exports = Comunicados;
