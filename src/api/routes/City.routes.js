const { upload } = require("../../middleware/files.middleware");
const { isAuthAdmin } = require("../../middleware/auth.middleware");
const {
  createCity,
  deleteCity,
  getByIdCity,
  getAllCity,
  toggleNeighborhoodInCity,
  toggleUserInCity,
} = require("../controllers/City.controller");
const express = require("express");

const CityRoutes = express.Router();

CityRoutes.post(
  "/create",
  [isAuthAdmin],
  upload.array("images", 5),
  createCity
);
CityRoutes.delete("/delete/:id", [isAuthAdmin], deleteCity);
CityRoutes.get("/:id", [isAuthAdmin], getByIdCity);
CityRoutes.get("/", [isAuthAdmin], getAllCity);
CityRoutes.patch(
  "/add/neighborhood/:id",
  [isAuthAdmin],
  toggleNeighborhoodInCity
);
CityRoutes.patch("/add/user/:id", [isAuthAdmin], toggleUserInCity);

module.exports = CityRoutes;
