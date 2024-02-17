const { upload } = require("../../middleware/files.middleware");

const { isAuth } = require("../../middleware/auth.middleware");

const { createRequest } = require("../controllers/Request.controller");
const express = require("express");

const RequestRoutes = express.Router();

RequestRoutes.post("/create", upload.array("images", 5), createRequest);

module.exports = MessageRoutes;
