const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema(
  {
    tituloEvents: {
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

const Events = mongoose.model("Events", EventsSchema);

module.exports = Eventos;
