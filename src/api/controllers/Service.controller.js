const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Service = require("../models/Service.model");
const User = require("../models/User.model");
const Neighborhood = require("../models/Neighborhood.model");

const createServices = async (req, res, next) => {
  let catchImgs = req?.files.map((file) => file.path);

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
      catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this service already exist");
    }
  } catch (error) {
    catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

const deleteServices = async (req, res, next) => {
  try {
    //!------------------------------------------------------------------------------------------
    const { id } = req.params;
    const serviceDelete = await Service.findById(id);
    const serviceDeleteImgs = serviceDelete.images;

    await Service.findByIdAndDelete(id);

    if (await Service.findById(id)) {
      return res.status(404).json("not deleted");
    } else {
      serviceDeleteImgs.forEach((image) => {
        deleteImgCloudinary(image);
      });

      return res.status(200).json("ok deleted");
    }
  } catch (error) {
    //!------------------------------------------------------------------------------------------
    return res.status(404).json(error.message);
  }
};

const toggleUsers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { users } = req.body;
    const serviceById = await Service.findById(id);

    if (serviceById) {
      const arrayIdUsers = users.split(",");
      Promise.all(
        arrayIdUsers.map(async (user, index) => {
          if (serviceById.users.includes(user)) {
            try {
              await Service.findByIdAndUpdate(id, {
                $pull: { users: user },
              });

              try {
                await User.findByIdAndUpdate(user, {
                  $pull: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update users",
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
                $push: { users: user },
              });
              try {
                await User.findByIdAndUpdate(users, {
                  $push: { Service: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update users",
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
            dataUpdate: await Service.findById(id).populate("users"),
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
/*
const createServices = async (req, res, next) => {
  let catchImgs = req?.files.map((file) => file.path);

  try {
    await Service.syncIndexes();

    const ServiceExist = await Service.findOne({ title: req.body.title });
    if (!ServiceExist) {
      const newService = new Service({ ...req.body, images: catchImgs });
*/ 

const updateServices = async (req, res, next) => {
  await Service.syncIndexes();
  let catchImg = req?.files.map((file) =>.path);
  try {
    const { id } = req.params;
    const characterById = await Character.findById(id);
    if (characterById) {
      const oldImg = characterById.image;

      const customBody = {
        _id: characterById._id,
        image: req.file?.path ? catchImg : oldImg,
        name: req.body?.name ? req.body?.name : characterById.name,
      };

      if (req.body?.gender) {
        const resultEnum = enumOk(req.body?.gender);
        customBody.gender = resultEnum.check
          ? req.body?.gender
          : characterById.gender;
      }

      try {
        await Character.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //** ------------------------------------------------------------------- */
        //** VAMOS A TESTEAR EN TIEMPO REAL QUE ESTO SE HAYA HECHO CORRECTAMENTE */
        //** ------------------------------------------------------------------- */

        // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID

        const characterByIdUpdate = await Character.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /** vamos a hacer un objeto vacion donde meteremos los test */

        let test = {};

        /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */

        elementUpdate.forEach((item) => {
          if (req.body[item] === characterByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          characterByIdUpdate.image === catchImg
            ? (test = { ...test, file: true })
            : (test = { ...test, file: false });
        }

        /** vamos a ver que no haya ningun false. Si hay un false lanzamos un 404,
         * si no hay ningun false entonces lanzamos un 200 porque todo esta correcte
         */

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
      } catch (error) {}
    } else {
      return res.status(404).json("este character no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

const getByIdService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const serviceById = await Service.findById(id);
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
    const allServices = await Service.find().populate("User");
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

const getByNameServices = async (req, res, next) => {
  try {
    const { title } = req.params;
    const serviceByName = await Service.find({ title });
    if (serviceByName.length > 0) {
      return res.status(200).json(serviceByName);
    } else {
      return res.status(404).json("no se ha encontrado");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar por nombre capturado en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createServices,
  deleteServices,
  toggleUsers,
  getByIdService,
  getAllServices,
  getByNameServices,
  updateServices,
};
