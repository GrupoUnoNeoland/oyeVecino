const User = require("../api/models/User.model");
const { verifyToken } = require("../utils/token");
const dotenv = require("dotenv");
dotenv.config();

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(error);
  }
};

const isAuthAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    console.log(decoded);
    req.user = await User.findById(decoded.id);

    if (req.user.rol !== "admin") {
      return next(new Error("Unauthorized, not admin"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

const isAuthSuperAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    console.log(decoded);
    req.user = await User.findById(decoded.id);

    if (req.user.rol !== "superAdmin") {
      return next(new Error("Unauthorized, not superAdmin"));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  isAuth,
  isAuthAdmin,
  isAuthSuperAdmin,
};
