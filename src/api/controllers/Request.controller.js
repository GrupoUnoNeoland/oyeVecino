const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const User = require("../models/User.model");
const Request = require("../models/Request.model");
const Neighborhood = require("../models/Neighborhood.model");

//--------- create

const createRequest = async (req, res, next) => {
  try {
    await Request.syncIndexes();
    const RequestExist = await Request.findOne({ user: req.body.user });
    if (!RequestExist) {
      const newRequest = new Request({ ...req.body });

      try {
        const RequestSave = await newRequest.save();

        if (RequestSave) {
          return res.status(200).json({
            request: RequestSave,
          });
          /*try {
            await Request.findOne({ neighborhood: req.body.neighborhood });
            return res.status(200).json({
              request: requestSave,
            });
          } catch (error) {
            return res.status(404).json("");
          }*/
        } else {
          return res.status(404).json("request not saved");
        }
      } catch (error) {
        return res.status(409).json(error.message);
      }
    } else {
      return res.status(409).json("this request already exists"); // sale siempre
    }
  } catch (error) {
    return next(error);
  }
};

//----------- delete

const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestDelete = await Request.findById(id);

    await Request.findByIdAndDelete(id);

    if (requestDelete) {
      try {
        await User.updateMany({ requests: _id }, { $pull: { requests: _id } });
        return res.status(200).json("Request deleted successfully");
      } catch (error) {
        return res.status(404).json("request not deleted from user");
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
    const requestById = await Request.findById(id);
    if (requestById) {
      return res.status(200).json(requestById);
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
    const allRequests = await Request.find();
    if (allRequests.length > 0) {
      return res.status(200).json(allRequests);
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
};
