const CityRoutes = require("express").Router();
const {
  createCity,
  deleteCity,
  getByIdCity,
  getAllCity,
} = require("../controllers/City.controller");
const { upload } = require("../../middleware/files.middleware");

CityRoutes.post("/create", upload.array("images", 5), createCity);
//CityRoutes.delete("/delete/:id", deleteCity);
//CityRoutes.get("/:id", getByIdCity);
//CityRoutes.get("/", getAllCity);
