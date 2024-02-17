const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const City = require("../models/City.model");
const Neighborhood = require("../models/Neighborhood.model");
const dotenv = require("dotenv");
dotenv.config();

//------------- create
const createCity = async (req, res, next) => {
  try {
    let catchImgs = req?.files?.map((file) => file.path);
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
const deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cityDelete = await City.findById(id);
    const cityDeleteImgs = cityDelete.images;
    const PORT = process.env.PORT;
    const neighborhoods = cityDelete.neighborhoods;
    // await City.findByIdAndDelete(id);

    if (false) {
      return res.status(404).json("not deleted");
    } else {
      cityDeleteImgs.forEach((image) => {
        deleteImgCloudinary(image);
      });

      //try {
      // await User.deleteMany({ city: id });
      try {
        console.log(await Service.find("65cfefbb040396cbf9099126"));
        /* try {
          await Service.deleteMany({
            neighborhoods: "65cfefbb040396cbf9099126",
          });
          try {
            await Statement.deleteMany({
              neighborhoods: ["65cfefbb040396cbf9099126"],
            });

            try {
              await Event.deleteMany({
                neighborhoods: ["65cfc4b561e49b8275470eb5"],
              });
              try {
                await Message.deleteMany({
                  neighborhoods: ["65cfc4b561e49b8275470eb5"],
                });
                return res.status(200).json("messages deleted");
              } catch (error) {
                return res.status(404).json("message not deleted");
              }
            } catch (error) {
              return res.status(404).json("event not deleted");
            }
          } catch (error) {
            return res.status(404).json("statement not deleted");
          }
        } catch (error) {
          return res.status(404).json("service not deleted");
        }
        /*neighborhoods.forEach((neighborhood) => {
          return res.redirect(
            307,
            `http://localhost:${PORT}/api/v1/neighborhoods/delete/${neighborhood}`
          );
        });

        /*  await Neighborhood.deleteMany({ city: id });
        return res.status(200).json({
          message: "Neighborhoods deleted",
        });*/
      } catch (error) {
        return res.status(404).json("neighborhoods not deleted");
      }
      // } catch (error) {
      //  return res.status(404).json("city not deleted");
      //    }
    }
  } catch (error) {
    return res.status(404).json("nothing deleted");
  }
};

//------------- get by id

const getByIdCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cityById = await City.findById(id);
    if (cityById) {
      return res.status(200).json(cityById);
    } else {
      return res.status(404).json("city not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//------------- get all

const getAllCity = async (req, res, next) => {
  try {
    const allCities = await City.find();
    if (allCities.length > 0) {
      return res.status(200).json(allCities);
    } else {
      return res.status(404).json("Cities not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

module.exports = {
  createCity,
  deleteCity,
  getByIdCity,
  getAllCity,
};
