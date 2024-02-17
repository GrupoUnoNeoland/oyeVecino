const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {
  createMessage,
  updateMessage,
  deleteMessege,
  getAllMessages,
  getByIdMessage,
} = require("../controllers/Message.controller");
const express = require("express");

const MessageRoutes = express.Router();

MessageRoutes.get("/:id", [isAuth], getByIdMessage);
MessageRoutes.post("/:id", [isAuth], upload.array("images", 2), createMessage);
MessageRoutes.patch(
  "/update/:id",
  [isAuth],
  upload.array("images", 2),
  updateMessage
);
MessageRoutes.delete("/delete/:id", [isAuth], deleteMessege);
MessageRoutes.get("/getallmessages/", [isAuth], getAllMessages);

module.exports = MessageRoutes;
