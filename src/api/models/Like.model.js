const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema(
  {
    like: {
      type: Number,
      required: true,
      max: 1,
    },
    userLike: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    type: {
      type: String,
      enum: ["event", "statement"],
    },
    event: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    statement: [{ type: mongoose.Schema.Types.ObjectId, ref: "Statement" }],
  },
  { timestamps: true }
);

const Like = mongoose.model("Like", LikeSchema);
module.exports = Like;
