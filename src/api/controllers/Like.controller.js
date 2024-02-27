const User = require("../models/User.model");
const Like = require("../models/Like.model");
const Event = require("../models/Event.model");
const Statement = require("../models/Statement.model");


const createLike = async (req, res, next) => {
  try {
    await Like.syncIndexes();

    if (req.body.type === "event") {
      const customBody = {
        like: 1,
        userLike: req.user._id,
        event: req.params.id,
        type: "event",
        city: req.user.city[0],
        neighborhoods: req.user.neighborhoods[0]
      };

      const newLike = new Like(customBody);
      try {
        const thereIsAlreadyALike = await Like.find({
          $and: [
            { userLike: req.user._id },
            {
              event: req.params.id,
            },
          ],
        });

        if (thereIsAlreadyALike.length == 0) {
          const savedLike = await newLike.save();
          if (savedLike) {
            try {
              await Event.findByIdAndUpdate(req.params.id, {
                $push: { likes: savedLike._id },
              });

              try {
                await User.findByIdAndUpdate(req.user._id, {
                  $push: { eventsFav: req.params.id },
                });

                try {
                  await Like.findByIdAndUpdate(
                    savedLike._id,
                    {
                      userLike: req.user._id,
                    },
                    {
                      event: req.params.id,
                    }
                  );

                  return res.status(200).json({ like: savedLike });
                } catch (error) {
                  return res.status(404).json({
                    error: "Error catch al actualizar el like",
                    message: error.message,
                  });
                }
              } catch (error) {
                return res.status(404).json({
                  error: "Error catch al actualizar el user",
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(404).json({
                error: "Error catch al actualizar el event",
                message: error.message,
              });
            }
          } else {
            return res.status(404).json({
              error: "Like no guardado",
            });
          }
        } else {
          return res.status(404).json({
            error: "Theres is already a like to this event",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "You can not give another like",
          message: error.message,
        });
      }
    } else if (req.body.type === "statement") {
      const customBody = {
        like: 1,
        userLike: req.user._id,
        statement: req.params.id,
        type: "statement",
      };

      const newLike = new Like(customBody);
      try {
        const thereIsAlreadyALike = await Like.find({
          $and: [
            { userLike: req.user._id },
            {
              statement: req.params.id,
            },
          ],
        });
        console.log("like", thereIsAlreadyALike);

        if (thereIsAlreadyALike.length == 0) {
          const savedLike = await newLike.save();
          if (savedLike) {
            try {
              await Statement.findByIdAndUpdate(req.params.id, {
                $push: { likes: savedLike._id },
              });

              try {
                await User.findByIdAndUpdate(req.user._id, {
                  $push: { statementsFav: req.params.id },
                });

                try {
                  await Like.findByIdAndUpdate(
                    savedLike._id,
                    {
                      userLike: req.user._id,
                    },
                    {
                      statement: req.params.id,
                    }
                  );

                  return res.status(200).json({ like: savedLike });
                } catch (error) {
                  return res.status(404).json({
                    error: "Error catch al actualizar el like",
                    message: error.message,
                  });
                }
              } catch (error) {
                return res.status(404).json({
                  error: "Error catch al actualizar el user",
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(404).json({
                error: "Error catch al actualizar el statement",
                message: error.message,
              });
            }
          } else {
            return res.status(404).json({
              error: "Like no guardado",
            });
          }
        } else {
          return res.status(404).json({
            error: "Theres is already a like to this event",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "You can not give another like",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error catch al crear el like",
      message: error.message,
    });
  }
};

const deleteLike = async (req, res, next) => {
  try {
    await Like.syncIndexes();
    const likeId = req.params.id;
    const type = req.body.type;

    const likeToDelete = await Like.findByIdAndDelete(likeId);

    try {
      const deletedLike = await Like.findById(likeId);
      if (!deletedLike) {
        if (type == "event") {
          try {
            await Event.findByIdAndUpdate(likeToDelete.event[0]._id, {
              $pull: { likes: likeToDelete._id },
            });

            try {
              await User.findByIdAndUpdate(likeToDelete.userLike[0]._id, {
                $pull: { eventsFav: likeToDelete.event[0]._id },
              });
              return res.status(200).json("Event like deleted");
            } catch (error) {
              return res.status(404).json({
                error: "events fav not deleted in user",
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: "likes not deleted in event",
              message: error.message,
            });
          }
        } else if (type == "statement") {
          try {
            await Statement.findByIdAndUpdate(likeToDelete.statement[0]._id, {
              $pull: { likes: likeToDelete._id },
            });

            try {
              await User.findByIdAndUpdate(likeToDelete.userLike[0]._id, {
                $pull: { statementsFav: likeToDelete.statement[0]._id },
              });
              return res.status(200).json("Statement like deleted");
            } catch (error) {
              return res.status(404).json({
                error: "Statement fav not deleted in user",
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: "likes not deleted in statement",
              message: error.message,
            });
          }
        }
      } else {
        return res.status(404).json({
          error: "Like not deleted",
          message: error.message,
        });
      }
    } catch (error) {
      return res.status(404).json({
        error: "Like not found",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(404).json({
      error: "like not deleted",
      message: error.message,
    });
  }
};

module.exports = { createLike, deleteLike };
