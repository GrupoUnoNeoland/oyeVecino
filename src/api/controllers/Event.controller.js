//!-----CREATE EVENT-----

const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Event = require("../models/Event.model.js");
const Message = require("../models/Message.model.js");
const Neighborhood = require("../models/Neighborhood.model.js");
const User = require("../models/User.model");

const createEvent = async (req, res, next) => {
  let catchImgs = req?.files?.map((file) => file.path);

  try {
    await Event.syncIndexes();

    const EventExist = await Event.findOne({ title: req.body.title });
    if (!EventExist) {
      const newEvent = new Event({
        ...req.body,
        images: catchImgs,
        organizer: req.user._id,
      });

      try {
        const EventSave = await newEvent.save();

        if (EventSave) {
          return res.status(200).json({
            service: EventSave,
          });
        } else {
          return res.status(404).json("event not saved");
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this event already exist");
    }
  } catch (error) {
    catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

//!-----------------------DELETE---------------------------------------

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventDelete = await Event.findById(id);
    const eventDeleteImgs = eventDelete.images;

    await Event.findByIdAndDelete(id);

    if (await Event.findById(id)) {
      return res.status(404).json("not deleted");
    } else {
      eventDeleteImgs.forEach((image) => {
        deleteImgCloudinary(image);
      });

      try {
        await User.updateMany({ eventsFav: id }, { $pull: { eventsFav: id } });
        try {
          await User.updateMany(
            { sponsoredEvents: id },
            { $pull: { sponsoredEvents: id } }
          );
          try {
            await Neighborhood.updateMany(
              { events: id },
              { $pull: { events: id } }
            );
            try {
              await Message.updateMany(
                { recipientEvent: id },
                { $pull: { recipientEvent: id } }
              );
              return res.status(200).json("service deleted ok");
            } catch (error) {
              return res
                .status(404)
                .json("recipientEvent not deleted from message");
            }
            return res.status(200).json("ok deleted");
          } catch (error) {
            return res
              .status(404)
              .json("service not deleted from neighborhood");
          }
        } catch (error) {
          return res.status(404).json("serviceDemanded not deleted");
        }
      } catch (error) {
        return res.status(404).json("user not deleted");
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//--------------- GET ALL OF LIKE ---------------------------------------------------------------------------------

const getAllEventsLike = async (req, res, next) => {
  try {
    const allEvents = await Event.find().populate("likes");
    console.log(allEvents);
    // if (allevent.length > 0) {
    //   const allServicesStar = allServices.map((service) => {
    //     const stars = service?.starReview?.stars || 0;
    //     const obj = { ...service };
    //     obj.stars = stars;
    //     return obj;
    //   });

    //   allServicesStar.sort((a, b) => b.stars - a.stars);
    //   return res.status(200).json({ services: allServicesStar });
    // } else {
    //   return res.status(404).json("Services not found");
    // }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//!--------------------getAllEvent---------------------

const getAllEvent = async (req, res, next) => {
  try {
    const allevent = await Event.find().populate(
      "comments likes neighborhoods sponsors"
    );
    /** el find nos devuelve un array */
    if (allevent.length > 0) {
      return res.status(200).json(allevent);
    } else {
      return res.status(404).json("no se han encontrado eventos");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//!------------------getByIdEvent-----------------------

const getByIdEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventById = await Event.findById(id).populate(
      "comments likes neighborhoods sponsors"
    );
    if (eventById) {
      return res.status(200).json(eventById);
    } else {
      return res.status(404).json("no se ha encontrado el evento");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//!--------------------UPDATE EVENT----------------------------

const updateEvent = async (req, res, next) => {
  let catchImg = req.files && req.files.map((file) => file.path);

  const { id } = req.params;

  try {
    await Event.syncIndexes();

    const patchEvent = new Event(req.body);
    console.log(patchEvent);

    try {
      const eventToUpdate = await Event.findById(id);
      req.files.length > 0
        ? (patchEvent.images = catchImg)
        : (patchEvent.images = eventToUpdate.images);

      req.files.length > 0 &&
        eventToUpdate.images.forEach((image) => deleteImgCloudinary(image));
      patchEvent._id = eventToUpdate._id;
      console.log(patchEvent);
      await Event.findByIdAndUpdate(id, patchEvent);

      const updateKeys = Object.keys(req.body);
      const updateEvent = await Event.findById(id);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        if (updateEvent[item] === req.body[item]) {
          testUpdate.push({
            [item]: true,
          });
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });
      console.log(req.files);
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
        updateEvent,
        testUpdate,
      });
    } catch (error) {
      req.files?.image &&
        catchImg.forEach((image) => deleteImgCloudinary(image));
      return res.status(404).json(error.message);
    }
  } catch (error) {
    req.files?.image && catchImg.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

//!-----------------------toggleNeighborhood en Event-------------------

const toggleNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { neighborhoods } = req.body;

    const eventById = await Event.findById(id);
    if (eventById) {
      const arrayIdneighborhood = neighborhoods.split(",");

      await Promise.all(
        arrayIdneighborhood.map(async (neighborhood) => {
          if (eventById.neighborhoods.includes(neighborhood)) {
            try {
              await Event.findByIdAndUpdate(id, {
                $pull: { neighborhoods: neighborhood },
              });

              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $pull: { events: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events",
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
              await Event.findByIdAndUpdate(id, {
                $push: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $push: { events: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events",
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
            dataUpdate: await Event.findById(id).populate("neighborhoods"),
          });
        });
    } else {
      return res.status(404).json("event not found");
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

//!-----------------------toggleComment en Event-------------------

const toggleComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const eventById = await Event.findById(id);
    if (eventById) {
      const arrayIdcomment = comments.split(",");

      await Promise.all(
        arrayIdcomment.map(async (comment) => {
          if (eventById.comments.includes(comment)) {
            try {
              await Event.findByIdAndUpdate(id, {
                $pull: { comments: comments },
              });

              try {
                await Message.findByIdAndUpdate(comment, {
                  $pull: { recipientEvent: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events",
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
              await Event.findByIdAndUpdate(id, {
                $push: { comments: comment },
              });
              try {
                await Message.findByIdAndUpdate(comment, {
                  $push: { recipientEvent: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events push",
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
            dataUpdate: await Event.findById(id).populate("comments"),
          });
        });
    } else {
      return res.status(404).json("event not found");
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

//!-----------------------toggleSponsor en Event-------------------

const toggleSponsor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sponsors } = req.body;

    const eventById = await Event.findById(id);
    if (eventById) {
      const arrayIdsponsor = sponsors.split(",");

      await Promise.all(
        arrayIdsponsor.map(async (sponsor) => {
          if (eventById.sponsors.includes(sponsor)) {
            try {
              await Event.findByIdAndUpdate(id, {
                $pull: { sponsors: sponsor },
              });

              try {
                await User.findByIdAndUpdate(sponsor, {
                  $pull: { sponsoredEvents: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update sponsors",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Event.findByIdAndUpdate(id, {
                $push: { sponsors: sponsor },
              });
              try {
                await User.findByIdAndUpdate(sponsor, {
                  $push: { sponsoredEvents: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events push",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update sponsors",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Event.findById(id).populate("sponsors"),
          });
        });
    } else {
      return res.status(404).json("event not found");
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

//!-----------------------toggleLike en EVENTS-------------------

const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const likes = req.body.eventsFav;
    console.log(req.body);
    const eventById = await Event.findById(id);
    if (eventById) {
      const arrayIdlike = likes.split(",");

      await Promise.all(
        arrayIdlike.map(async (like) => {
          if (eventById.likes.includes(like)) {
            try {
              await Event.findByIdAndUpdate(id, {
                $pull: { likes: like },
              });

              try {
                await User.findByIdAndUpdate(like, {
                  $pull: { eventsFav: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events",
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
              await Event.findByIdAndUpdate(id, {
                $push: { likes: like },
              });
              try {
                await User.findByIdAndUpdate(like, {
                  $push: { eventsFav: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events",
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
            dataUpdate: await Event.findById(id).populate("likes"),
          });
        });
    } else {
      return res.status(404).json("event not found");
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
    const eventById = await Event.findById(id);

    if (eventById) {
      if (eventById.city.includes(city)) {
        try {
          await Event.findByIdAndUpdate(id, {
            $pull: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Event.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update event",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await Event.findByIdAndUpdate(id, {
            $push: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Event.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update event",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this event doesn't exist");
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
  createEvent,
  deleteEvent,
  getAllEvent,
  getByIdEvent,
  toggleNeighborhood,
  toggleComment,
  updateEvent,
  toggleSponsor,
  toggleLike,
  getAllEventsLike,
  toggleCity,
};
