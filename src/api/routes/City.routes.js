const { upload } = require("../../middleware/files.middleware");
const {
  createCity,
  deleteCity,
  getByIdCity,
  getAllCity,
} = require("../controllers/City.controller");
const express = require("express");

const CityRoutes = express.Router();

CityRoutes.post("/create", upload.array("images", 5), createCity);
CityRoutes.delete("/delete/:id", deleteCity);
CityRoutes.get("/:id", getByIdCity);
CityRoutes.get("/", getAllCity);

module.exports = CityRoutes;
