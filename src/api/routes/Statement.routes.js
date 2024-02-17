const StatementRoutes = require("express").Router();

const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");

const {
  createStatement,
  deleteStatement,
  getAllStatement,
  getByIdStatement,
  toggleUser,
  toggleNeighborhood,
  toggleComment,
  toggleLike,
  updateStatement,
} = require("../controllers/Statement.controller");

StatementRoutes.patch("/add/:id", [isAuth], toggleUser);
StatementRoutes.patch("/add/neighborhoods/:id", [isAuth], toggleNeighborhood);
StatementRoutes.patch("/add/comments/:id", [isAuth], toggleComment);
StatementRoutes.patch("/add/likes/:id", [isAuth], toggleLike);
StatementRoutes.get("/", [isAuth], getAllStatement);
StatementRoutes.delete("/delete/:id", [isAuth], deleteStatement);
StatementRoutes.get("/:id", [isAuth], getByIdStatement);
StatementRoutes.post("/create", [isAuth], upload.array("images", 5), createStatement);
StatementRoutes.patch(
  "/update/statement/:id", [isAuth],
  upload.array("image", 5),
  updateStatement
);

module.exports = StatementRoutes;
