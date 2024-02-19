const { deleteImgCloudinary } = require("../../middleware/files.middleware");

const User = require("../models/User.model");
const Request = require("../models/Request.model");

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

//--------- create

const createRequest = async (req, res, next) => {
  try {
    let catchDocument = req.file.path;
    await Request.syncIndexes();

    const requestExist = await Request.findOne({ user: req.user._id });
    console.log("requestExist", requestExist)

    if (!requestExist) {
      const newRequest = new Request({
        ...req.body,
        neighborhood: req.user.neighborhoods[0],
        document: catchDocument,
      });

      try {
        const RequestSave = await newRequest.save();

        if (RequestSave) {
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailEnv,
              pass: password,
            },
          });

          const mailWaiting = {
            from: emailEnv,
            to: req.user.email,
            subject: "Validación de la documentación",
            text: `Querido/a ${req.user.name}, tu petición está en proceso. En breve tendrás noticias de nuestro equipo sobre su acceso. Gracias por confiar en nosotros ${req.user.name}`,
          };

          transporter.sendMail(mailWaiting, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                request: RequestSave,
                request: "error, send request",
              });
            }
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              request: RequestSave,
              RequestSave,
            });
          });
        } else {
          deleteImgCloudinary(catchDocument);
          return res.status(409).json("this request was not saved");
        }
      } catch (error) {
        deleteImgCloudinary(catchDocument);
        return res.status(404).json("Request not saved");
      }
    } else {
      deleteImgCloudinary(catchDocument);
      return res.status(409).json("this request already exists"); // sale siempre
    }
  } catch (error) {
    deleteImgCloudinary(catchDocument);
    return next(error);
  }
};

//-----
const toggleUserInRequest = async (req, res, next) => {
  try {
    console.log(req.user);
    const { id } = req.params;
    const userId = req.user._id;
    console.log();

    const userById = await User.findById(userId);
    const requestById = await Request.findById(id);
    console.log(requestById);

    if (requestById) {
      if (requestById.user.includes(userId)) {
        try {
          await User.findByIdAndUpdate(userId, { $pull: { request: id } });
          try {
            await Request.findByIdAndUpdate(id, { $pull: { user: userId } });
            return res.status(200).json({
              dataUpdate: await Request.findById(id),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update user key in request",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update request key in user",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await User.findByIdAndUpdate(userId, { $push: { request: id } });
          try {
            await Request.findByIdAndUpdate(id, { $push: { user: userId } });
            return res.status(200).json({
              dataUpdate: await Request.findById(id),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update user key in request",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update request key in user",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this request doesn't exist");
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

const toggleNeighborhoodInRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const neighborhoodId = req.user.neighborhoods[0];
    console.log(neighborhoodId);

    // const userById = await User.findById(userId);
    const requestById = await Request.findById(id);
    console.log(requestById);

    if (requestById) {
      if (requestById.neighborhoods.includes(neighborhoodId)) {
        try {
          await Request.findByIdAndUpdate(id, {
            $pull: { neighborhoods: neighborhoodId },
          });
          return res.status(200).json({
            dataUpdate: await Request.findById(id),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update neighborhoods key in request",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await Request.findByIdAndUpdate(id, {
            $push: { neighborhoods: neighborhoodId },
          });
          return res.status(200).json({
            dataUpdate: await Request.findById(id).populate("neighborhoods"),
          });
        } catch (error) {
          res.status(404).json({
            error: "error update neighborhoods key in request",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this request doesn't exist");
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

//----------- delete

const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestDelete = await Request.findById(id);

    if (requestDelete) {
      try {
        await Request.findByIdAndDelete(id);
        try {
          deleteImgCloudinary(requestDelete.document);
          await User.findByIdAndUpdate(req.user._id, {
            $pull: { request: id },
          });
          return res.status(200).json("request key updated in user");
        } catch (error) {
          return res.status(404).json("request not deleted from user");
        }
      } catch (error) {
        return res.status(404).json("Request not deleted");
      }
    } else {
      return res.status(404).json("Request not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//----------- get by id
const getByIdRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestById = await Request.findById(id).populate(
      "user neighborhoods"
    );
    if (requestById) {
      return res.status(200).json({
        dataUpdate: await Request.findById(id).populate("neighborhoods user"),
      });
    } else {
      return res.status(404).json("request not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//--------- get all

const getAllRequest = async (req, res, next) => {
  try {
    const allRequests = await Request.find().populate("user neighborhoods");
    if (allRequests.length > 0) {
      return res.status(200).json({
        dataUpdate: await Request.find().populate("neighborhoods user"),
      });
    } else {
      return res.status(404).json("Request not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createRequest,
  deleteRequest,
  getByIdRequest,
  getAllRequest,
  toggleUserInRequest,
  toggleNeighborhoodInRequest,
};
