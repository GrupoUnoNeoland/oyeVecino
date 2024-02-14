//!-----CREATE EVENT-----

const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Event = require("../models/Event.model.js");
const Neighborhood = require("../models/Neighborhood.model.js");
const User = require("../models/User.model");

const createEvent = async (req, res, next) => {
  let catchImgs = req?.files.map((file) => file.path);

  try {
    await Event.syncIndexes();

    const EventExist = await Event.findOne({ title: req.body.title });
    if (!EventExist) {
      const newEvent = new Event({ ...req.body, images: catchImgs });

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
      catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this event already exist");
    }
  } catch (error) {
    catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

//!-------------------DELETE---------------------------------------

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (event) {
      // lo buscamos para ver si sigue existiendo o no
      const finByIdevent = await Event.findById(id);

      try {
        const test = await Event.updateMany(
          { event: id },
          { $pull: { event: id } }
        );
        console.log(test);

        try {
          await User.updateMany({ eventFav: id }, { $pull: { eventFav: id } });

          return res.status(finByIdevent ? 404 : 200).json({
            deleteTest: finByIdevent ? false : true,
          });
        } catch (error) {
          return res.status(404).json({
            error: "error catch update User",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "error catch update event",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//!--------------------getAllEvent---------------------

const getAllEvent = async (req, res, next) => {
  try {
    const allevent = await Event.find();
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

module.exports = {
  createEvent,
  deleteEvent,
  getAllEvent,
};
