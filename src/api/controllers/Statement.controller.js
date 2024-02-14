//!-----CREATE STATEMENT-----

const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Neighborhood = require("../models/Neighborhood.model");
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
    if (getAllStatement.length > 0) {
      return res.status(200).json(getAllStatement);
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

//!------------------getByIdStatement-----------------------

const getByIdStatement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const statementById = await Statement.findById(id);
    if (statementById) {
      return res.status(200).json(statementById);
    } else {
      return res.status(404).json("no se ha encontrado el statement");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//!-----------------------toggleUser en Statement-------------------

const toggleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    const statementById = await Statement.findById(id);

    if (statementById) {
      const arrayIduser = users.split(",");

      Promise.all(
        arrayIduser.map(async (user, index) => {
          if (statementById.users.includes(user)) {
            try {
              await Statement.findByIdAndUpdate(id, {
                $pull: { users: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { statements: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update user",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update statement",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Statement.findByIdAndUpdate(id, {
                $push: { users: user },
              });
              try {
                await User.findByIdAndUpdate(user, {
                  $push: { statements: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update user",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update statement",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("users"),
          });
        });
    } else {
      return res.status(404).json("este statement no existe");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

//!-----------------------toggleNeighborhood en Statement-------------------

const toggleNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { neighborhood } = req.body;
    const statementById = await Statement.findById(id);

    if (statementById) {
      const arrayIdNeighborhood = neighborhood.split(",");

      Promise.all(
        arrayIdNeighborhood.map(async (neighborhood, index) => {
          if (statementById.neighborhood.includes(neighborhood)) {
            try {
              await Statement.findByIdAndUpdate(id, {
                $pull: { neighborhood: neighborhood },
              });

              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $pull: { statement: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhood",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update statement",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Statement.findByIdAndUpdate(id, {
                $push: { neighborhood: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $push: { statement: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhood",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update statement",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("neighborhood"),
          });
        });
    } else {
      return res.status(404).json("este statement no existe");
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch",
        message: error.message,
      }) && next(error)
    );
  }
};

module.exports = {
  createStatement,
  deleteStatement,
  getAllStatement,
  getByIdStatement,
  toggleUser,
  toggleNeighborhood,
};
