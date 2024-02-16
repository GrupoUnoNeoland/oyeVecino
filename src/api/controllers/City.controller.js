const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Neighborhood = require("../models/Neighborhood.model");
const City = require("../models/City.model");

//------------- create
const createCity = async (req, res, next) => {
  let catchImgs = req?.files?.map((file) => file.path);

  try {
    await City.syncIndexes();

    const CityExist = await City.findOne({ name: req.body.name });
    if (!CityExist) {
      const newCity = new City({ ...req.body, images: catchImgs });

      try {
        const CitySave = await newCity.save();

        if (CitySave) {
          return res.status(200).json({
            city: CitySave,
          });
        } else {
          return res.status(404).json("city not saved");
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      catchImgs.forEach((image) => deleteImgCloudinary(image));

      return res.status(409).json("this city already exists");
    }
  } catch (error) {
    catchImgs.forEach((image) => deleteImgCloudinary(image));
    return next(error);
  }
};

//------------- delete
//------------- get by id
//------------- get all

module.exports = {
  createCity,
  //deleteCity,
  //getByIdCity,
  //getAllCity,
  //updateServices,
};
