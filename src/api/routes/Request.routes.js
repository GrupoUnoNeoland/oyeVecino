const { isAuth } = require("../../middleware/auth.middleware");

const {
  createRequest,
  deleteRequest,
  getByIdRequest,
  getAllRequest,
} = require("../controllers/Request.controller");
const express = require("express");

const RequestRoutes = express.Router();

RequestRoutes.post("/create", createRequest);
RequestRoutes.delete("/delete/:id", deleteRequest);
RequestRoutes.get("/:id", getByIdRequest);
RequestRoutes.get("/", getAllRequest);
module.exports = RequestRoutes;
