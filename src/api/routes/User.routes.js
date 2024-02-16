const { isAuth, isAuthAdmin, isAuthSuperAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const { register, resendCode, sendCode, checkCodeNewUser, login, autoLogin, forgotPassword, sendPassword, modifyPassword, update, deleteUser, getAll, getById, toggleNeighborhood, toggleOfferedService, toggleDemandedService, togglePostedStatements, toggleFavEvents, toggleFavStatements } = require("../controllers/User.controllers");
const express = require("express");
const UserRoutes = express.Router();

UserRoutes.post("/register", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), register)

UserRoutes.post("/register/sendMail/:id", sendCode)
UserRoutes.post("/resend", resendCode);
UserRoutes.patch("/check", checkCodeNewUser);

UserRoutes.post("/login", login);
UserRoutes.post("/login/autologin", autoLogin);

UserRoutes.patch("/forgotpassword", forgotPassword);
UserRoutes.patch("/sendPassword/:id", sendPassword);
UserRoutes.patch("/changepassword", [isAuth], modifyPassword);

UserRoutes.patch("/update/update", [isAuth], upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), update);
UserRoutes.delete("/", [isAuth], deleteUser);
UserRoutes.get("/", getAll);
UserRoutes.get("/:id", getById);

UserRoutes.patch("/add/neighborhood/:id", toggleNeighborhood);
UserRoutes.patch("/add/servicesoffered/:id", toggleOfferedService);
UserRoutes.patch("/add/servicesdemanded/:id", toggleDemandedService);
UserRoutes.patch("/add/statement/:id", togglePostedStatements);
UserRoutes.patch("/add/eventsfav/:id", toggleFavEvents);
UserRoutes.patch("/add/statementsfav/:id", toggleFavStatements); toggleFavStatements


module.exports = UserRoutes;
