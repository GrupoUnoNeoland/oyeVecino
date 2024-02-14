const StatementRoutes = require("express").Router();

const { upload } = require("../../middleware/files.middleware");

const {
  createStatement,
  deleteStatement,
  getAllStatement,
  getByIdStatement,
  toggleUser,
  toggleNeighborhood,
} = require("../controllers/Statement.controller");

StatementRoutes.patch("/add/:id", toggleUser);
StatementRoutes.patch("/add/:id", toggleNeighborhood);
StatementRoutes.get("/", getAllStatement);
StatementRoutes.delete("/:id", deleteStatement);
StatementRoutes.get("/:id", getByIdStatement);

StatementRoutes.post("/create", upload.array("images", 5), createStatement);

module.exports = StatementRoutes;
