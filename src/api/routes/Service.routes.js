const { upload } = require("../../middleware/files.middleware");
const {
  createServices,
  deleteServices,
  toggleUsers,
  getByIdService,
  getAllServices,
  getByNameServices,
  updateServices,
} = require("../controllers/Service.controller");
const express = require("express");

const ServiceRoutes = express.Router();
ServiceRoutes.post("/create", upload.array("images", 5), createServices);
ServiceRoutes.delete("/delete/:id", deleteServices);
ServiceRoutes.patch("/add/:id", toggleUsers);
ServiceRoutes.get("/:id", getByIdService);
ServiceRoutes.get("/", getAllServices);
ServiceRoutes.get("/byName/:name", getByNameServices);
ServiceRoutes.patch("/:id", upload.array("image", 5), updateServices);

module.exports = ServiceRoutes;
