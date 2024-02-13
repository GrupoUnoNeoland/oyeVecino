const { isAuth, isAuthAdmin, isAuthSuperAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const { register, resendCode, sendCode, checkCodeNewUser, login } = require("../controllers/User.controllers");
const express = require("express");
const UserRoutes = express.Router();

UserRoutes.post("/register", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), register)
UserRoutes.post("/register/sendMail/:id", sendCode)
UserRoutes.post("/resend", resendCode);
UserRoutes.patch("/check", checkCodeNewUser);
UserRoutes.post("/login", login);


module.exports = UserRoutes;
