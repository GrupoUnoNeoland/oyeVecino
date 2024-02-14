const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Event = require("../models/Event.model");
const Neighborhood = require("../models/Neighborhood.model");
const Service = require("../models/Service.model");
const Statement = require("../models/Statement.model");
const User = require("../models/User.model");

// --------------------------------------------------------------------------------
const createNeighborhood = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await Neighborhood.syncIndexes();

    const newNeighborhood = new Neighborhood(req.body);

    if (req.file) {
      newNeighborhood.image = catchImg;
    } else {
      newNeighborhood.image =
        "https://www.zaragoza.es/cont/vistas/portal/participacion/img/distrito/junta-municipal-.png";
    }
    const savedNeighborhood = await newNeighborhood.save();

    return res
      .status(savedNeighborhood ? 200 : 404)
      .json(
        savedNeighborhood ? savedNeighborhood : "error al crear Neighborhood"
      );
  } catch (error) {
    req.file?.path && deleteImgCloudinary(catchImg);
    return res.status(404).json({
      error: "error catch create Neighborhood",
      message: error.message,
    });
  }
};
//-------------------------------------------------------------------------------------------------------

const deleteNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const NeighborhoodDelete = await Neighborhood.findById(id);

    const image = NeighborhoodDelete.image;
    await Neighborhood.findByIdAndDelete(id);
    deleteImgCloudinary(image);
    if (await Neighborhood.findById(id)) {
      return res.status(404).json("not deleted");
    } else {
      try {
        await User.updateMany(
          { neighborhoods: id },
          { $pull: { neighborhoods: id } }
        );
        try {
          await Service.updateMany(
            { neighborhoods: id },
            { $pull: { neighborhoods: id } }
          );

          try {
            await Event.updateMany(
              { neighborhoods: id },
              { $pull: { neighborhoods: id } }
            );
            try {
              await Statement.updateMany(
                { neighborhoods: id },
                { $pull: { neighborhoods: id } }
              );

              return res.status(200).json("neighborhood in service deleted ok");
            } catch (error) {
              return res
                .status(404)
                .json("Statement in neighborhood not deleted");
            }
          } catch (error) {
            return res.status(404).json("event in neighborhood not deleted");
          }
        } catch (error) {
          ("user in neighborhood not deleted");
        }
      } catch (error) {
        return res.status(404).json("user in neighborhood not deleted");
      }
    }
  } catch (error) {
    return next(error);
  }
};

//----------------------------------------------------------------------------------------------------------

const checkNewNeighborhood = async (req, res, next) => {
  try {
    const { postalCode } = req.body;

    const neighborhoddExists = await Neighborhood.findOne({ postalCode });

    if (!neighborhoddExists) {
      return (
        res.status(404).json("Neighborhood not found") &&
        deleteImgCloudinary(neighborhoddExists.image)
      );
    } else {
      return res.status(200).json({
        neighborhoddExists,
        check: true,
      });
    }
  } catch (error) {
    return next(setError(500, error.message || "General error check code"));
  }
};
//------------------------------------------------------------------------------------------------------

const updateNeighborhood = async (req, res, next) => {
  await Neighborhood.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const NeighborhoodById = await Neighborhood.findById(id);

    if (NeighborhoodById) {
      const oldImg = NeighborhoodById.image;

      const customBody = {
        _id: NeighborhoodById.id,
        image: req.file?.path ? catchImg : oldImg,
        name: req.body?.name ? req.body?.name : NeighborhoodById.name,
        postalCode: req.body?.postalCode
          ? req.body?.postalCode
          : NeighborhoodById.postalCode,
      };

      try {
        await Neighborhood.findByIdAndUpdate(id, customBody);

        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //---------TEST----------

        const NeighborhoodByIdUpdate = await Neighborhood.findById(id);

        const elementUpdate = Object.keys(req.body);

        let test = {};

        elementUpdate.forEach((item) => {
          if (req.body[item] === NeighborhoodByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          NeighborhoodByIdUpdate.image === catchImg
            ? (test = { ...test, file: true })
            : (test = { ...test, file: false });
        }

        let acc = 0;
        for (clave in test) {
          test[clave] == false && acc++;
        }

        if (acc > 0) {
          return res.status(404).json({
            dataTest: test,
            update: false,
          });
        } else {
          return res.status(200).json({
            dataTest: test,
            update: true,
          });
        }
      } catch (error) {
        console.log("🚀 ~ update ~ error:", error);

        return res.status(404).json("cannot update Neighborhood");
      }
    } else {
      return res.status(404).json("Neighborhood not exist");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

//---------------------toggle Users:

const toggleUsers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;

    const neighborhoodById = await Neighborhood.findById(id);
    console.log(id);
    if (neighborhoodById) {
      const arrayIdusers = users.split(",");

      await Promise.all(
        arrayIdusers.map(async (user) => {
          if (neighborhoodById.users.includes(user)) {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $pull: { users: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update user",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $push: { users: user },
              });
              try {
                console.log(user);
                await User.findByIdAndUpdate(user, {
                  $push: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update user",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Neighborhood.findById(id).populate("users"),
          });
        });
    } else {
      return res.status(404).json("neighborhood not found");
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

//--------------------------toggle Services:

const toggleServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { services } = req.body;

    const neighborhoodById = await Neighborhood.findById(id);
    console.log(id);
    if (neighborhoodById) {
      const arrayIdservices = services.split(",");

      await Promise.all(
        arrayIdservices.map(async (service) => {
          if (neighborhoodById.services.includes(service)) {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $pull: { services: service },
              });

              try {
                await Service.findByIdAndUpdate(service, {
                  $pull: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update service",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $push: { services: service },
              });
              try {
                console.log(service);
                await Service.findByIdAndUpdate(service, {
                  $push: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update service",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Neighborhood.findById(id).populate("services"),
          });
        });
    } else {
      return res.status(404).json("neighborhood not found");
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

//-----------------------------------toggle EVENTS

const toggleEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { events } = req.body;

    const neighborhoodById = await Neighborhood.findById(id);

    if (neighborhoodById) {
      const arrayIdevents = events.split(",");
      console.log("🚀 ~ toggleEvents ~ arrayIdevents:", arrayIdevents);

      await Promise.all(
        arrayIdevents.map(async (event) => {
          if (neighborhoodById.events.includes(event)) {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $pull: { events: event },
              });

              try {
                await Event.findByIdAndUpdate(event, {
                  $pull: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update event",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $push: { events: event },
              });
              try {
                await Event.findByIdAndUpdate(event, {
                  $push: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update event",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Neighborhood.findById(id).populate("events"),
          });
        });
    } else {
      return res.status(404).json("neighborhood not found");
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

//---------------------------toggle Statements

const toggleStatements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statements } = req.body;

    const neighborhoodById = await Neighborhood.findById(id);
    console.log(id);
    if (neighborhoodById) {
      const arrayIdstatements = statements.split(",");

      await Promise.all(
        arrayIdstatements.map(async (statement) => {
          if (neighborhoodById.statements.includes(statement)) {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $pull: { statements: statement },
              });

              try {
                await Statement.findByIdAndUpdate(statement, {
                  $pull: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update event",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Neighborhood.findByIdAndUpdate(id, {
                $push: { statements: statement },
              });
              try {
                await Statement.findByIdAndUpdate(statement, {
                  $push: { neighborhoods: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statement",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update neighborhood",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Neighborhood.findById(id).populate("statements"),
          });
        });
    } else {
      return res.status(404).json("neighborhood not found");
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
  createNeighborhood,
  deleteNeighborhood,
  checkNewNeighborhood,
  updateNeighborhood,
  toggleUsers,
  toggleServices,
  toggleEvents,
  toggleStatements,
};
