const mongoose = require("mongoose");

const EventosSchema = new mongoose.Schema(
  {
    tituloEventos: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    fecha: {
      type: String,
      required: true,
    },
    horario: {
      type: String,
      required: true,
    },
    precio: {
      type: Number,
      required: false,
    },
    organizadores: {
      type: String,
      required: false,
    },

    recipientComent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coment" }],
    recipientLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientBarrio: [{ type: mongoose.Schema.Types.ObjectId, ref: "Barrio" }],
  },
  {
    timestamps: true,
  }
);

const Eventos = mongoose.model("Eventos", EventosSchema);

module.exports = Eventos;
