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
  getAllServicesStar,
} = require("../controllers/Service.controller");
const express = require("express");

const ServiceRoutes = express.Router();
ServiceRoutes.post("/create", [isAuth], upload.any("images"), createServices);
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
ServiceRoutes.get("/getbyid/:id", [isAuth], getByIdService);
ServiceRoutes.get("/getall/:type", [isAuth], getAllServices);
ServiceRoutes.get("/getallorder", [isAuth], getAllServicesStar);
ServiceRoutes.patch("/add/neighborhoods/:id", [isAuth], toggleNeighborhoods);
ServiceRoutes.patch("/add/city/:id", [isAuth], toggleCity);
ServiceRoutes.get("/byName/:title", [isAuth], getByNameServices);
ServiceRoutes.patch(
  "/update/service/:id",
  upload.any("images"),
  [isAuth],
  updateServices
);
ServiceRoutes.post("/add/rating/:id", [isAuth], calculateStarsAverage);

module.exports = ServiceRoutes;
