const StatementRoutes = require("express").Router();

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

StatementRoutes.patch("/add/:id", toggleUser);
StatementRoutes.patch("/add/neighborhoods/:id", toggleNeighborhood);
StatementRoutes.patch("/add/comments/:id", toggleComment);
StatementRoutes.patch("/add/likes/:id", toggleLike);
StatementRoutes.get("/", getAllStatement);
StatementRoutes.delete("/delete/:id", deleteStatement);
StatementRoutes.get("/:id", getByIdStatement);

StatementRoutes.post("/create", upload.array("images", 5), createStatement);
StatementRoutes.patch(
  "/update/statement/:id",
  upload.array("image", 5),
  updateStatement
);

module.exports = StatementRoutes;
