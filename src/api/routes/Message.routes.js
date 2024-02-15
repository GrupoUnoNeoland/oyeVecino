const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {
  createMessage,
  updateMessage,
  deleteMessege,
  getAllMessages,
} = require("../controllers/Message.controller");
const express = require("express");

const MessageRoutes = express.Router();

MessageRoutes.post("/:id", upload.array("images", 2), [isAuth], createMessage);

MessageRoutes.patch("/update/:id", upload.array("images", 2), updateMessage);

MessageRoutes.delete("/delete/:id", deleteMessege);
MessageRoutes.get("/getallmessages/", getAllMessages);

module.exports = MessageRoutes;
