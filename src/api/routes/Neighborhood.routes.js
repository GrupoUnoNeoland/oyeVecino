const { upload } = require("../../middleware/files.middleware");
const {
  createNeighborhood,
  deleteNeighborhood,
  checkNewNeighborhood,
  updateNeighborhood,
  toggleUsers,
  toggleServices,
  toggleEvents,
  toggleStatements,
} = require("../controllers/Neighborhood.controllers");
const express = require("express");

const NeighborhoodRoutes = express.Router();

NeighborhoodRoutes.post("/", upload.single("image"), createNeighborhood);
NeighborhoodRoutes.delete("/delete/:id", deleteNeighborhood);
NeighborhoodRoutes.post("/check", checkNewNeighborhood);
NeighborhoodRoutes.patch(
  "/update/:id",
  upload.single("image"),
  updateNeighborhood
);
NeighborhoodRoutes.patch("/add/:id", toggleUsers);
NeighborhoodRoutes.patch("/add/services/:id", toggleServices);
NeighborhoodRoutes.patch("/add/events/:id", toggleEvents);
NeighborhoodRoutes.patch("/add/statements/:id", toggleStatements);

module.exports = NeighborhoodRoutes;
