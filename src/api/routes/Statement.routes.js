const StatementRoutes = require("express").Router();

const { upload } = require("../../middleware/files.middleware");

const {
  createStatement,
  deleteStatement,
} = require("../controllers/Statement.controller");

StatementRoutes.delete("/:id", deleteStatement);

StatementRoutes.post("/create", upload.array("images", 5), createStatement);

module.exports = StatementRoutes;
