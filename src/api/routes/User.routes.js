const { isAuth, isAuthAdmin, isAuthSuperAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const { register, resendCode, sendCode, checkCodeNewUser, login, autoLogin, forgotPassword, sendPassword, modifyPassword, update, deleteUser, getAll, getById, toggleNeighborhood, toggleOfferedService, toggleDemandedService, togglePostedStatements, toggleFavEvents, toggleFavStatements, registerAdmin, toggleCity, toggleRequestInUser } = require("../controllers/User.controllers");
const express = require("express");
const UserRoutes = express.Router();

UserRoutes.post("/register", upload.single('image'), register)
UserRoutes.post("/registeradmin", upload.single('image'), [isAuthSuperAdmin], registerAdmin)

UserRoutes.post("/register/sendMail/:id", sendCode)
UserRoutes.post("/resend", resendCode);
UserRoutes.patch("/check", checkCodeNewUser);

UserRoutes.post("/login", login);
UserRoutes.post("/login/autologin", autoLogin);

UserRoutes.patch("/forgotpassword", forgotPassword);
UserRoutes.patch("/sendPassword/:id", [isAuth], sendPassword);
UserRoutes.patch("/changepassword", [isAuth], modifyPassword);

UserRoutes.patch("/update/update", [isAuth], upload.single('image'), update);
UserRoutes.delete("/", [isAuth], deleteUser);
UserRoutes.get("/", [isAuth], getAll);
UserRoutes.get("/:id", [isAuth], getById);

UserRoutes.patch("/add/neighborhood/:id", [isAuthAdmin], toggleNeighborhood);
UserRoutes.patch("/add/servicesoffered/:id", [isAuth], toggleOfferedService);
UserRoutes.patch("/add/servicesdemanded/:id", [isAuth], toggleDemandedService);
UserRoutes.patch("/add/statement/:id", [isAuth], togglePostedStatements);
UserRoutes.patch("/add/eventsfav/:id", [isAuth], toggleFavEvents);
UserRoutes.patch("/add/statementsfav/:id", [isAuth], toggleFavStatements);
UserRoutes.patch("/add/city/:id", [isAuth], toggleCity);
UserRoutes.patch("/add/request/:id", [isAuthAdmin], toggleRequestInUser);


module.exports = UserRoutes;
