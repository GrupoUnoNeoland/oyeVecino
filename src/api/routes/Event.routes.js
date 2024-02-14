const EventRoutes = require("express").Router();

const { upload } = require("../../middleware/files.middleware");

const {
  createEvent,
  deleteEvent,
  getAllEvent,
  getByIdEvent,
} = require("../controllers/Event.controller");

EventRoutes.get("/", getAllEvent);
EventRoutes.delete("/:id", deleteEvent);
EventRoutes.get("/:id", getByIdEvent);

EventRoutes.post("/create", upload.array("images", 5), createEvent);

module.exports = EventRoutes;
