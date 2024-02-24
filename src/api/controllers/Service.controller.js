const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Service = require("../models/Service.model");
const User = require("../models/User.model");
const Neighborhood = require("../models/Neighborhood.model");
const Message = require("../models/Message.model");
const Rating = require("../models/Rating.model");

const createServices = async (req, res, next) => {
  let catchImgs = req?.files?.map((file) => file.path);

  try {
    await Service.syncIndexes();

    const ServiceExist = await Service.findOne({ title: req.body.title });
    if (!ServiceExist) {
      const newService = new Service({ ...req.body, images: catchImgs });

      try {
        const ServiceSave = await newService.save();

        if (ServiceSave) {
          return res.status(200).json({
            service: ServiceSave,
          });
        } else {
          return res.status(404).json("service not saved");
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this service already exist");
    }
  } catch (error) {
    catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

const deleteServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceDelete = await Service.findById(id);
    const serviceDeleteImgs = serviceDelete?.images;

    await Service.findByIdAndDelete(id);

    if (await Service.findById(id)) {
      return res.status(404).json("not deleted");
    } else {
      serviceDeleteImgs &&
        serviceDeleteImgs.forEach((image) => {
          deleteImgCloudinary(image);
        });

      try {
        await User.updateMany(
          { servicesOffered: id },
          { $pull: { servicesOffered: id } }
        );
        try {
          await User.updateMany(
            { servicesDemanded: id },
            { $pull: { servicesDemanded: id } }
          );
          try {
            const message = await Message.find({ recipientService: id });
            console.log(message.length);
            if (message.length > 0) {
              const messageId = message[0]._id.toString();

              await User.updateMany(
                { servicesComments: messageId },
                { $pull: { servicesComments: messageId } }
              );
            }

            try {
              await Neighborhood.updateMany(
                { services: id },
                { $pull: { services: id } }
              );
              try {
                const rating = await Rating.find({ service: id });
                rating && (await Rating.deleteMany({ service: id }));
                try {
                  message.length > 0 &&
                    (await Message.deleteMany({ recipientService: id }));
                  return res.status(200).json("deleted ok");
                } catch (error) {
                  return res.status(404).json("service message not deleted");
                }
              } catch (error) {
                return res.status(404).json("Service rating not deleted");
              }
            } catch (error) {
              return res
                .status(404)
                .json("Service  not deleted from neighborhood");
            }
          } catch (error) {
            return res
              .status(404)
              .json("servicesComments not deleted from user");
          }
        } catch (error) {
          return res.status(404).json("service demanded not deleted from user");
        }
      } catch (error) {
        return res.status(404).json("service offered not deleted from user");
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const toggleUsersServiceOffered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdUsers = users.split(",");
      Promise.all(
        arrayIdUsers.map(async (user) => {
          if (serviceById.provider.includes(user)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { provider: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { servicesOffered: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider offered",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service offered",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Service.findByIdAndUpdate(id, {
                $push: { provider: user },
              });
              try {
                await User.findByIdAndUpdate(user, {
                  $push: { servicesOffered: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service offered",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("provider"),
          });
        });
    } else {
      return res.status(404).json("this service doesn't exist");
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

const toggleUsersServiceDemanded = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdUsers = users.split(",");
      Promise.all(
        arrayIdUsers.map(async (user) => {
          if (serviceById.provider.includes(user)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { provider: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { servicesDemanded: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider demanded",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service demanded",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Service.findByIdAndUpdate(id, {
                $push: { provider: user },
              });
              try {
                await User.findByIdAndUpdate(user, {
                  $push: { servicesDemanded: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update provider",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service demanded",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("provider"),
          });
        });
    } else {
      return res.status(404).json("this service doesn't exist");
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

const toggleNeighborhoods = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { neighborhoods } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdNeighborhood = neighborhoods.split(",");
      Promise.all(
        arrayIdNeighborhood.map(async (neighborhood) => {
          if (serviceById.neighborhoods.includes(neighborhood)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $pull: { services: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhood",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await Service.findByIdAndUpdate(id, {
                $push: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $push: { services: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhoods",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update service",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("neighborhoods"),
          });
        });
    } else {
      return res.status(404).json("this service doesn't exist");
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
    const serviceById = await Service.findById(id);

    if (serviceById) {
      if (serviceById.city.includes(city)) {
        try {
          await Service.findByIdAndUpdate(id, {
            $pull: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update service",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await Service.findByIdAndUpdate(id, {
            $push: { city: city },
          });
          return res.status(200).json({
            dataUpdate: await Service.findById(id).populate("city"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update service",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this service doesn't exist");
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

// const toggleComments = async (req, res, next) => {
// try {
//   const { id } = req.params;
//   const { comments } = req.body;
//   const serviceById = await Service.findById(id);

//   if (serviceById) {
//     const arrayIdComments = comments.split(",");
//     Promise.all(
//       arrayIdComments.map(async (comment) => {
//         if (serviceById.comments.includes(comment)) {
//           try {
//             await Service.findByIdAndUpdate(id, {
//               $pull: { comments: comment },
//             });

//             try {
//               await Message.findByIdAndUpdate(comment, {
//                 $pull: { services: id },
//               });
//             } catch (error) {
//               res.status(404).json({
//                 error: "error update comment",
//                 message: error.message,
//               }) && next(error);
//             }
//           } catch (error) {
//             res.status(404).json({
//               error: "error update service",
//               message: error.message,
//             }) && next(error);
//           }
//         } else {
//           try {
//             await Service.findByIdAndUpdate(id, {
//               $push: { comments: comment },
//             });
//             try {
//               await Message.findByIdAndUpdate(comment, {
//                 $push: { services: id },
//               });
//             } catch (error) {
//               res.status(404).json({
//                 error: "error update comments",
//                 message: error.message,
//               }) && next(error);
//             }
//           } catch (error) {
//             res.status(404).json({
//               error: "error update service",
//               message: error.message,
//             }) && next(error);
//           }
//         }
//       })
//     )
//       .catch((error) => res.status(404).json(error.message))
//       .then(async () => {
//         return res.status(200).json({
//           dataUpdate: await Service.findById(id).populate("comments"),
//         });
//       });
//   } else {
//     return res.status(404).json("this service doesn't exist");
//   }
// } catch (error) {
//   return (
//     res.status(404).json({
//       error: "error catch",
//       message: error.message,
//     }) && next(error)
//   );
// }
// };

//-------------- UPDATE
const updateServices = async (req, res, next) => {
  let catchImg = req.files.map((file) => file.path);
  console.log(req.files);
  const { id } = req.params;

  try {
    await Service.syncIndexes();

    const patchService = new Service(req.body);

    req.files && (patchService.images = catchImg);

    try {
      const serviceToUpdate = await Service.findById(id);

      req.files &&
        serviceToUpdate.images.forEach((image) => deleteImgCloudinary(image));
      patchService._id = serviceToUpdate._id;
      await Service.findByIdAndUpdate(id, patchService);

      const updateKeys = Object.keys(req.body);
      const updateService = await Service.findById(id);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        console.log(updateService[item], req.body[item]);
        if (serviceToUpdate[item] !== req.body[item]) {
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
        console.log(updateService.images, catchImg);
        catchImg.length > 0
          ? testUpdate.push({
            image: true,
          })
          : testUpdate.push({
            image: false,
          });
      }

      return res.status(200).json({
        updateService,
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

const getByIdService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceById = await Service.findById(id).populate(
      "provider comments neighborhoods starReview"
    );
    if (serviceById) {
      return res.status(200).json(serviceById);
    } else {
      return res.status(404).json("service not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const getAllServices = async (req, res, next) => {
  try {
    const allServices = await Service.find().populate(
      "provider comments neighborhoods"
    );
    if (allServices.length > 0) {
      return res.status(200).json(allServices);
    } else {
      return res.status(404).json("Services not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

const getAllServicesStar = async (req, res, next) => {
  try {
    const allServices = await Service.find().populate(
      "starReview provider comments neighborhoods"
    );

    if (allServices.length > 0) {
      const allServicesStar = allServices.map((service) => {
        const stars = service?.starReview?.stars || 0;
        const obj = { ...service };
        obj.stars = stars;
        return obj;
      });

      allServicesStar.sort((a, b) => b.stars - a.stars);
      return res.status(200).json({ services: allServicesStar });
    } else {
      return res.status(404).json("Services not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

const getByNameServices = async (req, res, next) => {
  try {
    const { title } = req.params;
    const serviceByName = await Service.find({ title });

    if (serviceByName.length > 0) {
      return res.status(200).json(serviceByName);
    } else {
      return res.status(404).json("not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar por nombre capturado en el catch",
      message: error.message,
    });
  }
};

const calculateStarsAverage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const allUserReviews = await Rating.find({ userServiceProvider: id });
    const allStars = allUserReviews.map((review) => review.stars);
    const totalStars = allStars.reduce((acc, currentStar) => {
      acc += currentStar;
      return acc;
    }, 0);

    const starsAverage = Math.round(totalStars / allStars.length);
    return starsAverage;
  } catch (error) {
    return res
      .status(404)
      .json({ error: error.message, message: "Average stars not caculated" });
  }
};

module.exports = {
  createServices,
  deleteServices,
  toggleUsersServiceOffered,
  toggleUsersServiceDemanded,
  toggleNeighborhoods,
  toggleCity,
  getByIdService,
  getAllServices,
  getByNameServices,
  updateServices,
  calculateStarsAverage,
  getAllServicesStar,
};
