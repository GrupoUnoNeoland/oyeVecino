//!-----CREATE STATEMENT-----

const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Message = require("../models/Message.model");
const Neighborhood = require("../models/Neighborhood.model");
const Statement = require("../models/Statement.model");
const User = require("../models/User.model");

const createStatement = async (req, res, next) => {
  let catchImgs = req?.files?.map((file) => file.path);

  try {
    await Statement.syncIndexes();

    const StatementExist = await Statement.findOne({ title: req.body.title });
    if (!StatementExist) {
      const newStatement = new Statement({ ...req.body, images: catchImgs });
      newStatement.owner[0] = req.user._id;

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
      catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this Statement already exist");
    }
  } catch (error) {
    catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

//!-----------------------DELETE STATEMNT---------------------------------------

const deleteStatement = async (req, res, next) => {
  const userLogged = req.user._id
  const isAdmin = req.user.rol === "admin"

  try {
    const { id } = req.params;
    const statementDelete = await Statement.findById(id);
    const statementDeleteImgs = statementDelete?.images;

    if (statementDelete) {
      const isUserLoggedTheStatementOwner = userLogged._id.toString() == statementDelete.users[0]._id.toString()
      console.log(userLogged._id.toString(), statementDelete.users[0]._id.toString())
      if (isUserLoggedTheStatementOwner || isAdmin) {
        await Statement.findByIdAndDelete(id);
        statementDeleteImgs && statementDeleteImgs.forEach((image) => {
          deleteImgCloudinary(image);
        });

        try {
          await User.updateMany(
            { statementsFav: id },
            { $pull: { statementsFav: id } }
          );
          try {
            await User.updateMany(
              { statements: id },
              { $pull: { statements: id } }
            );
            try {
              await Neighborhood.updateMany(
                { statements: id },
                { $pull: { statements: id } }
              );
              return res.status(200).json("ok deleted");
            } catch (error) {
              return res
                .status(404)
                .json("statements user not deleted from neighborhood");
            }
          } catch (error) {
            return res.status(404).json("statements  not deleted");
          }
        } catch (error) {
          return res.status(404).json("statementFav not deleted");
        }
      } else {
        return res.status(404).json("this event can not be deleted by this user")
      }
    } else {
      return res.status(404).json("this statement do not exist")
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//--------------- GET ALL OF LIKE ---------------------------------------------------------------------------------
const getAllStatementLike = async (req, res, next) => {
  try {
    const allStatements = await Statement.find();

    if (allStatements.length > 0) {
      // const allStatementLikes = allStatments.map((statement) => {
      //   console.log(statement);
      // const likes = statement?.likes || 0;
      // const obj = { ...statement };
      // obj.stars = stars;
      // return obj;
      // });

      allStatements.sort((a, b) => b.likes.length - a.likes.length);
      return res.status(200).json({ statements: allStatements });
    } else {
      return res.status(404).json("Statement not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//!--------------------getAllStatement---------------------

const getAllStatement = async (req, res, next) => {
  try {
    const getAllStatement = await Statement.find().populate(
      "comments likes owner neighborhoods"
    );
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
    const statementById = await Statement.findById(id).populate(
      "comments likes owner neighborhoods"
    );
    if (statementById) {
      return res.status(200).json(statementById);
    } else {
      return res.status(404).json("no se ha encontrado el statement");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//!--------------------UPDATE STATEMENT----------------------------

const updateStatement = async (req, res, next) => {
  let catchImg = req.files && req.files.map((file) => file.path);

  const { id } = req.params;

  try {
    await Statement.syncIndexes();

    const patchStatement = new Statement(req.body);

    req.files.length > 0 && (patchStatement.images = catchImg);

    try {
      const statementToUpdate = await Statement.findById(id);
      req.files.length > 0
        ? (patchStatement.images = catchImg)
        : (patchStatement.images = statementToUpdate.images);

      req.files.length > 0 &&
        statementToUpdate.images.forEach((image) => deleteImgCloudinary(image));
      patchStatement._id = statementToUpdate._id;
      await Statement.findByIdAndUpdate(id, patchStatement);

      const updateKeys = Object.keys(req.body);
      const updateStatement = await Statement.findById(id);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        if (statementToUpdate[item] === req.body[item]) {
          testUpdate.push({
            [item]: false,
          });
        } else {
          testUpdate.push({
            [item]: true,
          });
        }
      });

      if (req.files) {
        catchImg.length > 0
          ? testUpdate.push({
            image: true,
          })
          : testUpdate.push({
            image: false,
          });
      }

      return res.status(200).json({
        updateStatement,
        testUpdate,
      });
    } catch (error) {
      req.files && catchImg.forEach((image) => deleteImgCloudinary(image));
      return res.status(404).json(error.message);
    }
  } catch (error) {
    req.files && catchImg.forEach((image) => deleteImgCloudinary(image));
    return next(error);
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
          if (statementById.owner.includes(user)) {
            try {
              await Statement.findByIdAndUpdate(id, {
                $pull: { owner: user },
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
                $push: { owner: user },
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
            dataUpdate: await Statement.findById(id).populate("owner"),
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
  1;
  try {
    const { id } = req.params;
    const { neighborhoods } = req.body;

    const statementById = await Statement.findById(id);
    if (statementById) {
      const arrayIdneighborhood = neighborhoods.split(",");

      await Promise.all(
        arrayIdneighborhood.map(async (neighborhood) => {
          if (statementById.neighborhoods.includes(neighborhood)) {
            try {
              await Statement.findByIdAndUpdate(id, {
                $pull: { neighborhoods: neighborhood },
              });

              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $pull: { statements: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statements",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhoods",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Statement.findByIdAndUpdate(id, {
                $push: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $push: { statements: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statements",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhoods",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("neighborhoods"),
          });
        });
    } else {
      return res.status(404).json("statement not found");
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

//!-----------------------toggleComment en Statement-------------------

const toggleComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const statementById = await Statement.findById(id);
    if (statementById) {
      const arrayIdcomment = comments.split(",");

      await Promise.all(
        arrayIdcomment.map(async (comment) => {
          if (statementById.comments.includes(comment)) {
            try {
              await Statement.findByIdAndUpdate(id, {
                $pull: { comments: comments },
              });

              try {
                await Message.findByIdAndUpdate(comment, {
                  $pull: { statements: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statements",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update comments",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Statement.findByIdAndUpdate(id, {
                $push: { comments: comment },
              });
              try {
                await Message.findByIdAndUpdate(comment, {
                  $push: { comments: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statements",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update comments",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("comments"),
          });
        });
    } else {
      return res.status(404).json("statement not found");
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

//!-----------------------toggleLike en Statement-------------------

const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const likes = req.body.statementsFav;
    console.log(req.body);
    const statementById = await Statement.findById(id);
    if (statementById) {
      const arrayIdlike = likes.split(",");

      await Promise.all(
        arrayIdlike.map(async (like) => {
          if (statementById.likes.includes(like)) {
            try {
              await Statement.findByIdAndUpdate(id, {
                $pull: { likes: like },
              });

              try {
                await User.findByIdAndUpdate(like, {
                  $pull: { statementsFav: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statements",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update likes",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Statement.findByIdAndUpdate(id, {
                $push: { likes: like },
              });
              try {
                await User.findByIdAndUpdate(like, {
                  $push: { statementsFav: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statements",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update likes",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("likes"),
          });
        });
    } else {
      return res.status(404).json("statement not found");
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

const toggleCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city } = req.body;
    const statementById = await Statement.findById(id);

    if (statementById) {
      if (statementById.city.includes(city)) {
        try {
          await Statement.findByIdAndUpdate(id, {
            $pull: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update statement",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await Statement.findByIdAndUpdate(id, {
            $push: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Statement.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update statement",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this statement doesn't exist");
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
  toggleComment,
  toggleLike,
  updateStatement,
  getAllStatementLike,
  toggleCity,
};
