//!-----CREATE STATEMENT-----

const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Statement = require("../models/Statement.model");
const User = require("../models/User.model");

const createStatement = async (req, res, next) => {
  let catchImgs = req?.files.map((file) => file.path);

  try {
    await Statement.syncIndexes();

    const StatementExist = await Statement.findOne({ title: req.body.title });
    if (!StatementExist) {
      const newStatement = new Statement({ ...req.body, images: catchImgs });

      try {
        const StatementSave = await newStatement.save();

        if (StatementSave) {
          return res.status(200).json({
            service: StatementSave,
          });
        } else {
          return res.status(404).json("Statement not saved");
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this Statement already exist");
    }
  } catch (error) {
    catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

//!-----------------DELETE-------------------------------------------

const deleteStatement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const statement = await Statement.findByIdAndDelete(id);
    if (statement) {
      // lo buscamos para ver si sigue existiendo o no
      const finByIdstatement = await Statement.findById(id);

      try {
        const test = await Statement.updateMany(
          { statement: id },
          { $pull: { statement: id } }
        );
        console.log(test);

        try {
          await User.updateMany(
            { statementFav: id },
            { $pull: { statementFav: id } }
          );

          return res.status(finByIdstatement ? 404 : 200).json({
            deleteTest: finByIdstatement ? false : true,
          });
        } catch (error) {
          return res.status(404).json({
            error: "error catch update User",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "error catch update statement",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//!--------------------getAllEvent---------------------

const getAllStatement = async (req, res, next) => {
  try {
    const getAllStatement = await Statement.find();
    /** el find nos devuelve un array */
    if (allstatement.length > 0) {
      return res.status(200).json(allstatement);
    } else {
      return res.status(404).json("no se han encontrado statement");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createStatement,
  deleteStatement,
  getAllStatement,
};
