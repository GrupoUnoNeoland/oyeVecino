const EventRoutes = require("express").Router();

const { upload } = require("../../middleware/files.middleware");

const {
  createEvent,
  deleteEvent,
  getAllEvent,
  getByIdEvent,
  toggleNeighborhood,
  toggleComment,
  toggleSponsor,
  updateEvent,
  toggleLike,
} = require("../controllers/Event.controller");

EventRoutes.get("/", getAllEvent);
EventRoutes.delete("/delete/:id", deleteEvent);
EventRoutes.get("/:id", getByIdEvent);
EventRoutes.patch("/add/neighborhoods/:id", toggleNeighborhood);
EventRoutes.patch("/add/comments/:id", toggleComment);
EventRoutes.patch("/add/sponsors/:id", toggleSponsor);
EventRoutes.patch("/add/likes/:id", toggleLike);

EventRoutes.post("/create", upload.array("images", 5), createEvent);
EventRoutes.patch("/update/event/:id", upload.array("image", 5), updateEvent);

module.exports = EventRoutes;
