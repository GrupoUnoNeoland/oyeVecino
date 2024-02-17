const User = require("../models/User.model");
const Rating = require("../models/Rating.model");

//------------------------------------* CREATE RATING--------------------------------------

const createRating = async (req, res, next) => {
  try {
    await Rating.syncIndexes();

    const customBody = {
      stars: req.body?.stars,
      userServiceTaker: req.user._id,
      userServiceProvider: req.params.id,
      companyServiceProvider: req.body?.company,
    };

    const newRating = new Rating(customBody);
    const savedRating = await newRating.save();
    if (savedRating) {
      try {
        await User.findByIdAndUpdate(req.params.id, {
          $push: { starsReviews: savedRating._id },
        });
        try {
          await User.findByIdAndUpdate(req.body.company, {
            $push: { companyStarsReviews: savedRating._id },
          });

          return res.status(200).json(savedRating);
        } catch (error) {
          return res.status(404).json({
            error: "Error catch al actualizar la empresa",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "Error catch al actualizar el user",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json({
        error: "Rating no guardado",
      });
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error catch al crear el rating",
      message: error.message,
    });
  }
};

module.exports = { createRating };
