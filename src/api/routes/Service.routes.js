const { upload } = require("../../middleware/files.middleware");
const {
  createServices,
  deleteServices,
  toggleUsersServiceOffered,
  toggleUsersServiceDemanded,
  toggleNeighborhoods,
  toggleComments,
  getByIdService,
  getAllServices,
  getByNameServices,
  updateServices,
} = require("../controllers/Service.controller");
const express = require("express");

const ServiceRoutes = express.Router();
ServiceRoutes.post("/create", upload.array("images", 5), createServices);
ServiceRoutes.delete("/delete/:id", deleteServices);
ServiceRoutes.patch("/add/users/serviceoffered/:id", toggleUsersServiceOffered);
ServiceRoutes.patch(
  "/add/users/servicedemanded/:id",
  toggleUsersServiceDemanded
);
ServiceRoutes.patch("/add/neighborhoods/:id", toggleNeighborhoods);
ServiceRoutes.patch("/add/comments/:id", toggleComments);
ServiceRoutes.get("/:id", getByIdService);
ServiceRoutes.get("/", getAllServices);
ServiceRoutes.get("/byName/:title", getByNameServices);
ServiceRoutes.patch(
  "/update/service/:id",
  upload.array("image", 5),
  updateServices
);

module.exports = ServiceRoutes;
