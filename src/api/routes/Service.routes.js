const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {
  createServices,
  deleteServices,
  toggleUsersServiceOffered,
  toggleUsersServiceDemanded,
  toggleNeighborhoods,
  toggleCity,
  toggleComments,
  getByIdService,
  getAllServices,
  getByNameServices,
  updateServices,
  calculateStarsAverage,
} = require("../controllers/Service.controller");
const express = require("express");

const ServiceRoutes = express.Router();
ServiceRoutes.post(
  "/create",
  [isAuth],
  upload.array("images", 5),
  createServices
);
ServiceRoutes.delete("/delete/:id", [isAuth], deleteServices);
ServiceRoutes.patch(
  "/add/users/serviceoffered/:id",
  [isAuth],
  toggleUsersServiceOffered
);
ServiceRoutes.patch(
  "/add/users/servicedemanded/:id",
  [isAuth],
  toggleUsersServiceDemanded
);
ServiceRoutes.patch("/add/neighborhoods/:id", [isAuth], toggleNeighborhoods);
ServiceRoutes.patch("/add/city/:id", [isAuth], toggleCity);
ServiceRoutes.patch("/add/comments/:id", [isAuth], toggleComments);
ServiceRoutes.get("/:id", [isAuth], getByIdService);
ServiceRoutes.get("/", [isAuth], getAllServices);
ServiceRoutes.get("/byName/:title", [isAuth], getByNameServices);
ServiceRoutes.patch(
  "/update/service/:id",
  upload.array("image", 5),
  [isAuth],
  updateServices
);
ServiceRoutes.post("/add/rating/:id", [isAuth], calculateStarsAverage);

module.exports = ServiceRoutes;
