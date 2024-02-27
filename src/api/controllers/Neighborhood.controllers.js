const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Chat = require("../models/Chat.model");
const City = require("../models/City.model");
const Event = require("../models/Event.model");
const Like = require("../models/Like.model");
const Message = require("../models/Message.model");
const Neighborhood = require("../models/Neighborhood.model");
const Rating = require("../models/Rating.model");
const Request = require("../models/Request.model");
const Service = require("../models/Service.model");
const Statement = require("../models/Statement.model");
const User = require("../models/User.model");

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

const getByIdNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const neighborhoodById = await Neighborhood.findById(id).populate(
      "users services events statements requests"
    );

    if (neighborhoodById) {
      return res.status(200).json(neighborhoodById);
    } else {
      return res.status(404).json("no se ha encontrado el neighborhood");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const getAllNeighborhood = async (req, res, next) => {
  try {
    const allneighborhood = await Neighborhood.find().populate(
      "events statements users events requests"
    );

    if (allneighborhood.length > 0) {
      return res.status(200).json(allneighborhood);
    } else {
      return res.status(404).json("no se han encontrado barrios");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

const deleteNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const neighborhoodDelete = await Neighborhood.findById(id);
    const neighborhoodImage = neighborhoodDelete.image;

    if (neighborhoodDelete) {
      try {
        await Neighborhood.findByIdAndDelete(id);
        try {
          deleteImgCloudinary(neighborhoodImage);
          await City.updateMany(
            { neighborhoods: id },
            {
              $pull: { neighborhoods: id },
            }
          );
          try {
            await User.deleteMany({ neighborhoods: id });
            try {
              await Service.deleteMany({ neighborhoods: id });
              try {
                await Statement.deleteMany({ neighborhoods: id });
                try {
                  await Event.deleteMany({ neighborhoods: id });
                  try {
                    await Request.deleteMany({ neighborhoods: id });
                    try {
                      await Like.deleteMany({ neighborhoods: id });
                      try {
                        await Message.deleteMany({ neighborhoods: id });
                        try {
                          await Rating.deleteMany({ neighborhoods: id });
                          try {
                            await Chat.deleteMany({ neighborhoods: id });
                            return res.status(200).json("neighborhood delete ok");
                          } catch (error) {
                            return res.status(200).json("all chats deleted");
                          }
                        } catch (error) {
                          return res.status(200).json("all request deleted");
                        }
                      } catch (error) {
                        return res.status(404).json("messages not deleted");
                      }
                    } catch (error) {
                      return res.status(404).json("likes not deleted");
                    }
                  } catch (error) {
                    return res.status(404).json("requests not deleted");
                  }
                } catch (error) {
                  return res.status(404).json("event not deleted");
                }
              } catch (error) {
                return res.status(404).json("statement not deleted");
              }
            } catch (error) {
              return res.status(404).json("service not deleted");
            }
          } catch (error) {
            return res.status(404).json("user not deleted");
          }
        } catch (error) {
          return res.status(404).json("neighborhoods key not updated in city");
        }
      } catch (error) {
        return res.status(404).json("neighborhood not deleted");
      }
    } else {
      return res.status(404).json("neighborhood not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

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
            dataTest: await Neighborhood.findById(id),
            update: false,
          });
        } else {
          return res.status(200).json({
            dataTest: await Neighborhood.findById(id),
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

const toggleStatements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statements } = req.body;

    const neighborhoodById = await Neighborhood.findById(id);

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

const togglecityInNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cityId = req.body.city;

    const cityById = await City.findById(cityId);
    const neighborhoodById = await Neighborhood.findById(id);

    if (cityById) {
      if (cityById.neighborhoods.includes(id)) {
        try {
          await City.findByIdAndUpdate(cityId, {
            $pull: { neighborhoods: id },
          });
          try {
            await Neighborhood.findByIdAndUpdate(id, {
              $pull: { city: cityId },
            });
            return res.status(200).json({
              dataUpdate: await Neighborhood.findById(id),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in neighborhood",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update neighborhood in city",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await City.findByIdAndUpdate(cityId, {
            $push: { neighborhoods: id },
          });
          try {
            await Neighborhood.findByIdAndUpdate(id, {
              $push: { city: cityId },
            });
            return res.status(200).json({
              dataUpdate: await Neighborhood.findById(id).populate("city"),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in neighborhood",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update neighborhood in city",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this city doesn't exist");
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
  updateNeighborhood,
  toggleUsers,
  toggleServices,
  toggleEvents,
  toggleStatements,
  getByIdNeighborhood,
  getAllNeighborhood,
  togglecityInNeighborhood,
};
