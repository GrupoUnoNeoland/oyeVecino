const User = require("../models/User.model");
const Rating = require("../models/Rating.model");
const Service = require("../models/Service.model");

const createRating = async (req, res, next) => {
  try {
    await Rating.syncIndexes();
    const service = await Service.findById(req.body.serviceId);
    const userServiceProvider = service.provider[0];

    const customBody = {
      stars: req.body?.stars,
      userServiceTaker: req.user._id,
      userServiceProvider: userServiceProvider,
      service: req.body.serviceId,
      city: req.user.city[0],
      neighborhoods: req.user.neighborhoods[0]
    };

    const isTheSameUser =
      req.user._id.toString() == userServiceProvider.toString();
    console.log(isTheSameUser);
    if (!isTheSameUser) {
      const newRating = new Rating(customBody);
      const savedRating = await newRating.save();
      console.log("savedRating", savedRating);
      if (savedRating) {
        try {
          console.log(customBody.stars);
          const points = customBody.stars * 10;
          const user = await User.findById(userServiceProvider);
          const oldPoints = user?.points || 0;

          const newPoints = oldPoints + points;
          try {
            await User.findByIdAndUpdate(userServiceProvider, {
              points: newPoints,
            });
            try {
              console.log(customBody.stars);
              await Service.findByIdAndUpdate(req.body.serviceId, {
                $push: { starReview: savedRating._id },
              });
              return res
                .status(200)
                .json(await User.findById(userServiceProvider));
            } catch (error) {
              return res.status(404).json({
                error: "can't update starsReview in service",
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: "can't update point in user",
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "can't find user",
            message: error.message,
          });
        }
      } else {
        return res.status(404).json({
          error: "Rating no guardado",
        });
      }
    } else {
      return res.status(404).json("You can't rating yourself");
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error catch al crear el rating",
      message: error.message,
    });
  }
};

module.exports = { createRating };
