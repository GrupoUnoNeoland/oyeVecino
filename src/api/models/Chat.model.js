const { mongoose } = require("mongoose");

const ChatSchema = new mongoose.Schema({
  messages: [{ type: mongoose.Schema.ObjectId, ref: "Message" }],
  userOne: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  userTwo: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
