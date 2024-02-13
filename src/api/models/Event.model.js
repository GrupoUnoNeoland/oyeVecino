const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    adress: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    date: {
      type: String,
      required: true,
    },
    timetable: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: false,
    },
    organizer: {
      type: String,
      required: false,
    },

    recipientComments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    ],
    recipientLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    recipientUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recipientNeighborhoods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
