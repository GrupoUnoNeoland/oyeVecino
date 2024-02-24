const express = require("express");
const { isAuth } = require("../../middleware/auth.middleware");
const { createLike, deleteLike } = require("../controllers/Like.controllers");

const LikeRoutes = express.Router();

LikeRoutes.post("/create/:id", [isAuth], createLike);
LikeRoutes.delete("/delete/:id", [isAuth], deleteLike);

module.exports = LikeRoutes;
