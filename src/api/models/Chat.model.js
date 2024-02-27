const { mongoose } = require("mongoose");

const ChatSchema = new mongoose.Schema({
  messages: [{ type: mongoose.Schema.ObjectId, ref: "Message" }],
  userOne: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  userTwo: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  city: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
  neighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
