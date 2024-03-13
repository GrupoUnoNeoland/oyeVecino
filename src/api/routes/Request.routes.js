const { isAuth, isAuthAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {
  createRequest,
  updateRequest,
  deleteRequest,
  getByIdRequest,
  getAllRequest,
  toggleUserInRequest,
  toggleNeighborhoodInRequest,
  toggleCityInRequest,
} = require("../controllers/Request.controller");
const express = require("express");

const RequestRoutes = express.Router();

RequestRoutes.post(
  "/create/",
  [isAuth],
  upload.single("document"),
  createRequest
);
RequestRoutes.patch("/update/:id", [isAuthAdmin], updateRequest);
RequestRoutes.delete("/delete/:id", [isAuth], deleteRequest);
RequestRoutes.get("/:id", [isAuthAdmin], getByIdRequest);
RequestRoutes.get("/", [isAuthAdmin], getAllRequest);
RequestRoutes.patch("/add/user/:id", [isAuthAdmin], toggleUserInRequest);
RequestRoutes.patch("/add/city/:id", [isAuthAdmin], toggleCityInRequest);
RequestRoutes.patch(
  "/add/neighborhood/:id",
  [isAuthAdmin],
  toggleNeighborhoodInRequest
);

module.exports = RequestRoutes;
