const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Event = require("../models/Event.model.js");
const Like = require("../models/Like.model.js");
const Message = require("../models/Message.model.js");
const Neighborhood = require("../models/Neighborhood.model.js");
const User = require("../models/User.model");

const createEvent = async (req, res, next) => {
  let catchImgs = [];
  if (req.files.length > 0) {
    catchImgs = req?.files?.map((file) => file.path);
  } else {
    catchImgs = [
      "https://res.cloudinary.com/dqiveomlb/image/upload/v1709843092/APP/EVENTO%20DEFAULT.gif",
    ];
  }
  try {
    await Event.syncIndexes();

    // const EventExist = await Event.findOne({ title: req.body.title });
    // if (!EventExist) {
    const newEvent = new Event({
      ...req.body,
      images: catchImgs,
      organizer: req.user._id,
      city: req.user.city[0],
      neighborhoods: req.user.neighborhoods[0],
    });

    try {
      const EventSave = await newEvent.save();

      if (EventSave) {
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: { events: EventSave._id },
          });
        } catch (error) {
          res.status(404).json({
            error: "error update events in user",
            message: error.message,
          }) && next(error);
        }
        return res.status(200).json({
          service: EventSave,
        });
      } else {
        return res.status(404).json("event not saved");
      }
    } catch (error) {
      return res.status(404).json(error.message);
    }
    // } else {
    //   catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));

    //   return res.status(409).json("this event already exist");
    // }
  } catch (error) {
    catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

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
              await Message.deleteMany({ recipientEvent: id });
              try {
                await User.updateOne({ events: id }, { $pull: { events: id } });
                /*try {
                  await User.updateMany(
                    { eventsComments: eventMessage._id },
                    { $pull: { eventsComments: eventMessage._id } }
                  );*/
                try {
                  await Like.deleteMany({ event: eventDelete._id });
                  return res.status(200).json("likes deleted ok from events");
                } catch (error) {
                  return res.status(404).json("likes not deleted");
                }
                /*} catch (error) {
                  return res
                    .status(404)
                    .json("eventsComments not deleted from user");
                }*/
              } catch (error) {
                return res.status(404).json("event not updated from user");
              }
            } catch (error) {
              return res
                .status(404)
                .json("recipientEvent not deleted from message");
            }
          } catch (error) {
            return res.status(404).json("event not deleted from neighborhood");
          }
        } catch (error) {
          return res.status(404).json("eventDemanded not deleted");
        }
      } catch (error) {
        return res.status(404).json("user not deleted");
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const getAllEventsLike = async (req, res, next) => {
  try {
    const allEvents = await Event.find();

    if (allEvents.length > 0) {
      allEvents.sort((a, b) => b.likes.length - a.likes.length);
      return res.status(200).json({ events: allEvents });
    } else {
      return res.status(404).json("Event not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

const getAllEvent = async (req, res, next) => {
  try {
    const allevent = await Event.find().populate(
      "comments likes neighborhoods sponsors"
    );
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

const getByIdEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventById = await Event.findById(id).populate(
      "comments likes neighborhoods sponsors organizer"
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

const updateEvent = async (req, res, next) => {
  let catchImg = req.files.map((file) => file.path);

  const { id } = req.params;

  try {
    await Event.syncIndexes();

    const patchEvent = new Event(req.body);

    req.files && (patchEvent.images = catchImg);
    console.log(patchEvent.images);

    try {
      const eventToUpdate = await Event.findById(id);
      console.log("eventToUpdate", eventToUpdate);
      req.files &&
        eventToUpdate.images.forEach((image) => deleteImgCloudinary(image));
      patchEvent._id = eventToUpdate._id;
      await Event.findByIdAndUpdate(id, patchEvent);

      const updateKeys = Object.keys(req.body);
      const updateEvent = await Event.findById(id);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        console.log(updateEvent[item], req.body[item]);
        if (eventToUpdate[item] !== req.body[item]) {
          testUpdate.push({
            [item]: true,
          });
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      if (req.files) {
        console.log(updateEvent.images, catchImg);
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
      console.log("hola");
      req.files && catchImg.forEach((image) => deleteImgCloudinary(image));
      return res.status(404).json(error.message);
    }
  } catch (error) {
    req.files && catchImg.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

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

const toggleOrganizer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { organizer } = req.body;

    const eventById = await Event.findById(id);
    if (eventById) {
      const arrayIdorganizer = organizer.split(",");

      await Promise.all(
        arrayIdorganizer.map(async (organizer) => {
          if (eventById.organizer.includes(organizer)) {
            try {
              await Event.findByIdAndUpdate(id, {
                $pull: { organizer: organizer },
              });

              try {
                await User.findByIdAndUpdate(organizer, {
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
                error: "error update organizer",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Event.findByIdAndUpdate(id, {
                $push: { organizer: organizer },
              });
              try {
                await User.findByIdAndUpdate(organizer, {
                  $push: { events: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update events push",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update organizer",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json({ error: error.message }))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Event.findById(id).populate("organizer"),
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
  updateEvent,
  toggleSponsor,
  toggleLike,
  getAllEventsLike,
  toggleCity,
  toggleOrganizer,
};
