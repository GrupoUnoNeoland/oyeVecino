const { deleteImgCloudinary } = require("../../middleware/files.middleware");

const User = require("../models/User.model");
const Neighborhood = require("../models/Neighborhood.model");
const Message = require("../models/Message.model");
const Service = require("../models/Service.model");
const Statement = require("../models/Statement.model");
const Event = require("../models/Event.model");
const Chat = require("../models/Chat.model");

const randomCode = require("../../utils/randomCode");
const { generateToken } = require("../../utils/token");
const randomPassword = require("../../utils/randomPassword");
const enumOk = require("../../utils/enumOk");

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const Rating = require("../models/Rating.model");
const City = require("../models/City.model");

dotenv.config();

const register = async (req, res, next) => {
  let catchImg = req.file.path;

  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { email, name } = req.body;

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );

    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });

      if (catchImg) {
        newUser.image = catchImg;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const userSave = await newUser.save();

        if (userSave) {
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailEnv,
              pass: password,
            },
          });

          const mailOptions = {
            from: emailEnv,
            to: email,
            subject: "Confirmation code",
            text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: userSave,
                confirmationCode: "error, resend code",
              });
            }
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              user: userSave,
              confirmationCode,
            });
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.files) {
        deleteImgCloudinary(catchImg);
      }
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    if (req.files) {
      deleteImgCloudinary(catchImg);
    }
    return next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  let catchImg = req.files?.image[0].path;
  let catchDocument = req.files?.document[0].path;

  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { email, name } = req.body;

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );

    if (!userExist) {
      const newUser = new User({ ...req.body, rol: "admin", confirmationCode });

      if (req.files.image) {
        newUser.image = catchImg;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      if (req.files.document) {
        newUser.document = catchDocument;
      } else {
        return res.status(404).json("error, document not found");
      }

      try {
        const userSave = await newUser.save();

        if (userSave) {
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailEnv,
              pass: password,
            },
          });

          const mailOptions = {
            from: emailEnv,
            to: email,
            subject: "Confirmation code",
            text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: userSave,
                confirmationCode: "error, resend code",
              });
            }
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              user: userSave,
              confirmationCode,
            });
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.files) {
        deleteImgCloudinary(catchImg);
        deleteImgCloudinary(catchDocument);
      }
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    if (req.files) {
      deleteImgCloudinary(catchImg);
      deleteImgCloudinary(catchDocument);
    }
    return next(error);
  }
};

const sendCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDB = await User.findById(id);

    const emailEnv = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailEnv,
        pass: password,
      },
    });

    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: "Confirmation code",
      text: `tu codigo es ${userDB.confirmationCode}, gracias por confiar en nosotros ${userDB.name}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json({
          user: userDB,
          confirmationCode: "error, resend code",
        });
      }
      console.log("Email sent: " + info.response);
      return res.status(200).json({
        user: userDB,
        confirmationCode: userDB.confirmationCode,
      });
    });
  } catch (error) {
    return next(error);
  }
};

const resendCode = async (req, res, next) => {
  try {
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });

    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      const mailOptions = {
        from: email,
        to: req.body.email,
        subject: "Confirmation code",
        text: `tu codigo es ${userExists.confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(404).json({
            resend: false,
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json("User not found");
    }
  } catch (error) {
    return next(setError(500, error.message || "Error general send code"));
  }
};

const checkCodeNewUser = async (req, res, next) => {
  try {
    const { email, confirmationCode } = req.body;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(404).json("User not found");
    } else {
      console.log("184", confirmationCode, userExists.confirmationCode);
      if (confirmationCode === userExists.confirmationCode) {
        console.log("186", confirmationCode, userExists.confirmationCode);
        try {
          await userExists.updateOne({ confirmationCodeChecked: true });

          const updateUser = await User.findOne({ email });

          return res.status(200).json({
            testCheckOk:
              updateUser.confirmationCodeChecked == true ? true : false,
          });
        } catch (error) {
          return res.status(404).json(error.message);
        }
      } else {
        console.log("199", confirmationCode, userExists.confirmationCode);
        try {
          await User.findByIdAndDelete(userExists._id);

          deleteImgCloudinary(userExists.image);

          return res.status(200).json({
            userExists,
            check: false,

            delete: (await User.findById(userExists._id))
              ? "error delete user"
              : "ok delete user",
          });
        } catch (error) {
          return res
            .status(404)
            .json(error.message || "error general delete user");
        }
      }
    }
  } catch (error) {
    return next(setError(500, error.message || "General error check code"));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      if (bcrypt.compareSync(password, userDB.password)) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

const autoLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      if (password == userDB.password) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    const userDb = await User.findOne({ email });

    if (userDb) {
      const PORT = process.env.PORT;
      return res.redirect(
        307,
        `http://localhost:${PORT}/api/v1/users/sendPassword/${userDb._id}`
      );
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

const sendPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDb = await User.findById(id);
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });
    let passwordSecure = randomPassword();
    console.log(passwordSecure);
    const mailOptions = {
      from: email,
      to: userDb.email,
      subject: "-----",
      text: `User: ${userDb.name}. Su nuevo codigo de login es ${passwordSecure} Hemos enviado esto porque tenemos una solicitud de cambio de contraseña, si no has sido tú ponte en contacto con nosotros, gracias.`,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json("dont send email and dont update user");
      } else {
        console.log("Email sent: " + info.response);

        const newPasswordBcrypt = bcrypt.hashSync(passwordSecure, 10);

        try {
          await User.findByIdAndUpdate(id, { password: newPasswordBcrypt });

          const userUpdatePassword = await User.findById(id);

          if (bcrypt.compareSync(passwordSecure, userUpdatePassword.password)) {
            return res.status(200).json({
              updateUser: true,
              sendPassword: true,
            });
          } else {
            return res.status(404).json({
              updateUser: false,
              sendPassword: true,
            });
          }
        } catch (error) {
          return res.status(404).json(error.message);
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

const modifyPassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const { _id } = req.user;

    if (bcrypt.compareSync(password, req.user.password)) {
      const newPasswordHashed = bcrypt.hashSync(newPassword, 10);

      try {
        await User.findByIdAndUpdate(_id, { password: newPasswordHashed });

        const userUpdate = await User.findById(_id);

        if (bcrypt.compareSync(newPassword, userUpdate.password)) {
          return res.status(200).json({
            updateUser: true,
          });
        } else {
          return res.status(404).json({
            updateUser: false,
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      return res.status(404).json("password dont match");
    }
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  let catchImg = req.file.path;

  try {
    await User.syncIndexes();

    const patchUser = new User(req.body);

    req.files.image && (patchUser.image = catchImg);
    req.files.document && (patchUser.document = catchDocument);

    patchUser._id = req.user._id;
    patchUser.password = req.user.password;
    patchUser.rol = req.user.rol;
    patchUser.confirmationCode = req.user.confirmationCode;
    patchUser.email = req.user.email;
    patchUser.confirmationCodeChecked = req.user.confirmationCodeChecked;
    patchUser.cif = req.user.cif;

    if (req.body?.gender) {
      const resultEnum = enumOk(req.body?.gender);
      patchUser.gender = resultEnum.check ? req.body?.gender : req.user.gender;
    }

    try {
      await User.findByIdAndUpdate(req.user._id, patchUser);

      req.file.path && deleteImgCloudinary(req.user.image);

      const updateUser = await User.findById(req.user._id);

      const updateKeys = Object.keys(req.body);

      const testUpdate = [];

      updateKeys.forEach((item) => {
        if (updateUser[item] === req.body[item]) {
          if (updateUser[item] != req.user[item]) {
            testUpdate.push({
              [item]: true,
            });
          } else {
            testUpdate.push({
              [item]: "sameOldInfo",
            });
          }
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      if (req.file.path) {
        updateUser.image === catchImg
          ? testUpdate.push({
            image: true,
          })
          : testUpdate.push({
            image: false,
          });
      }

      return res.status(200).json({
        updateUser,
        testUpdate,
      });
    } catch (error) {
      req.file.path && deleteImgCloudinary(catchImg);
      return res.status(404).json(error.message);
    }
  } catch (error) {
    req.file.path && deleteImgCloudinary(catchImg);
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const isUser = req.user.rol === "vecino";
  const isAdmin = req.user.rol === "admin";
  if (isUser) {
    try {
      const { _id, image } = req.user;
      await User.findByIdAndDelete(_id);

      if (await User.findById(_id)) {
        return res.status(404).json("not deleted"); ///
      } else {
        deleteImgCloudinary(image);
        return res.status(200).json("ok delete");
      }
    } catch (error) {
      return next(error);
    }
  } else if (isAdmin) {
    try {
      const { userId } = req.body;
      const { image } = await User.findById(userId);
      await User.findByIdAndDelete(userId);
      const userToDelete = await User.findById(userId);

      if (userToDelete) {
        return res.status(404).json("not deleted"); ///
      } else {
        deleteImgCloudinary(image);
        return res.status(200).json("ok delete");
      }
    } catch (error) {
      return next(error);
    }
  }
};

const getAll = async (req, res, next) => {
  try {
    const allUser = await User.find().populate(
      "neighborhoods servicesOffered servicesDemanded servicesComments eventsComments statementsComments receivedMessages postedMessages chats statements eventsFav statementsFav sponsoredEvents starsReviews"
    );

    if (allUser.length > 0) {
      return res
        .status(200)
        .json(await User.find());
    } else {
      return res.status(404).json("users no found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error to get users",
      message: error.message,
    });
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usersById = await User.findById(id).populate(
      "neighborhoods servicesOffered servicesDemanded servicesComments eventsComments statementsComments receivedMessages postedMessages chats statements eventsFav statementsFav sponsoredEvents starsReviews"
    );
    if (usersById) {
      return res.status(200).json(usersById);
    } else {
      return res.status(404).json("user not found");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const toggleNeighborhood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { neighborhoods } = req.body;

    const userById = await User.findById(id);

    if (userById) {
      const arrayIdNeighborhoods = neighborhoods.split(",");

      Promise.all(
        arrayIdNeighborhoods.map(async (neighborhood, index) => {
          if (userById.neighborhoods.includes(neighborhood)) {
            try {
              await User.findByIdAndUpdate(id, {
                $pull: { neighborhoods: neighborhood },
              });

              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $pull: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhood",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await User.findByIdAndUpdate(id, {
                $push: { neighborhoods: neighborhood },
              });
              try {
                await Neighborhood.findByIdAndUpdate(neighborhood, {
                  $push: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update neighborhood",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await User.findById(id).populate("neighborhoods"),
          });
        });
    } else {
      return res.status(404).json("this user do not exist");
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

    const userById = await User.findById(id);

    if (userById) {
      if (userById.city.includes(city)) {
        try {
          await City.findByIdAndUpdate(city, {
            $pull: { users: id },
          });
          try {
            await User.findByIdAndUpdate(id, {
              $pull: { city: city },
            });
            return res.status(200).json({
              dataUpdate: await User.findById(id).populate("city"),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in user",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update user in city",
            message: error.message,
          }) && next(error);
        }
      } else {
        try {
          await City.findByIdAndUpdate(city, {
            $push: { users: id },
          });
          try {
            await User.findByIdAndUpdate(id, {
              $push: { city: city },
            });
            return res.status(200).json({
              dataUpdate: await User.findById(id).populate("city"),
            });
          } catch (error) {
            res.status(404).json({
              error: "error update city in user",
              message: error.message,
            }) && next(error);
          }
        } catch (error) {
          res.status(404).json({
            error: "error update user in city",
            message: error.message,
          }) && next(error);
        }
      }
    } else {
      return res.status(404).json("this user do not exist");
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

const toggleOfferedService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { services } = req.body;

    const userById = await User.findById(id);

    if (userById) {
      const arrayIdServices = services.split(",");

      Promise.all(
        arrayIdServices.map(async (service, index) => {
          if (userById.servicesOffered.includes(service)) {
            try {
              await User.findByIdAndUpdate(id, {
                $pull: { servicesOffered: service },
              });

              try {
                await Service.findByIdAndUpdate(service, {
                  $pull: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update offered service",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await User.findByIdAndUpdate(id, {
                $push: { servicesOffered: service },
              });
              try {
                await Service.findByIdAndUpdate(service, {
                  $push: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update offered service",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await User.findById(id).populate("servicesOffered"),
          });
        });
    } else {
      return res.status(404).json("this user do not exist");
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

const toggleDemandedService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { services } = req.body;

    const userById = await User.findById(id);

    if (userById) {
      const arrayIdServices = services.split(",");

      Promise.all(
        arrayIdServices.map(async (service, index) => {
          if (userById.servicesDemanded.includes(service)) {
            try {
              await User.findByIdAndUpdate(id, {
                $pull: { servicesDemanded: service },
              });

              try {
                await Service.findByIdAndUpdate(service, {
                  $pull: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update demanded service",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await User.findByIdAndUpdate(id, {
                $push: { servicesDemanded: service },
              });
              try {
                await Service.findByIdAndUpdate(service, {
                  $push: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update demanded service",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await User.findById(id).populate("servicesDemanded"),
          });
        });
    } else {
      return res.status(404).json("this user do not exist");
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

const togglePostedStatements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statements } = req.body;

    const userById = await User.findById(id);

    if (userById) {
      const arrayIdStatements = statements.split(",");

      Promise.all(
        arrayIdStatements.map(async (statement, index) => {
          if (userById.statements.includes(statement)) {
            try {
              await User.findByIdAndUpdate(id, {
                $pull: { statements: statement },
              });

              try {
                await Statement.findByIdAndUpdate(statement, {
                  $pull: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statement",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await User.findByIdAndUpdate(id, {
                $push: { statements: statement },
              });
              try {
                await Statement.findByIdAndUpdate(statement, {
                  $push: { users: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statement",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await User.findById(id).populate("statements"),
          });
        });
    } else {
      return res.status(404).json("this user do not exist");
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

const toggleFavEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eventsFav } = req.body;

    const userById = await User.findById(id);

    if (userById) {
      const arrayIdEventsFav = eventsFav.split(",");

      Promise.all(
        arrayIdEventsFav.map(async (eventFav, index) => {
          if (userById.eventsFav.includes(eventFav)) {
            try {
              await User.findByIdAndUpdate(id, {
                $pull: { eventsFav: eventFav },
              });

              try {
                await Event.findByIdAndUpdate(eventFav, {
                  $pull: { likes: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update eventsFav",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await User.findByIdAndUpdate(id, {
                $push: { eventsFav: eventFav },
              });
              try {
                await Event.findByIdAndUpdate(eventFav, {
                  $push: { likes: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update eventsFav",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await User.findById(id).populate("eventsFav"),
          });
        });
    } else {
      return res.status(404).json("this user do not exist");
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

const toggleFavStatements = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statementsFav } = req.body;

    const userById = await User.findById(id);

    if (userById) {
      const arrayIdStatementsFav = statementsFav.split(",");

      Promise.all(
        arrayIdStatementsFav.map(async (statementFav, index) => {
          if (userById.statementsFav.includes(statementFav)) {
            try {
              await User.findByIdAndUpdate(id, {
                $pull: { statementsFav: statementFav },
              });

              try {
                await Statement.findByIdAndUpdate(statementFav, {
                  $pull: { likes: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statementsFav",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          } else {
            try {
              await User.findByIdAndUpdate(id, {
                $push: { statementsFav: statementFav },
              });
              try {
                await Statement.findByIdAndUpdate(statementFav, {
                  $push: { likes: id },
                });
              } catch (error) {
                res.status(404).json({
                  error: "error update statementsFav",
                  message: error.message,
                }) && next(error);
              }
            } catch (error) {
              res.status(404).json({
                error: "error update user",
                message: error.message,
              }) && next(error);
            }
          }
        })
      )
        .catch((error) => res.status(404).json(error.message))
        .then(async () => {
          return res.status(200).json({
            dataUpdate: await User.findById(id).populate("statementsFav"),
          });
        });
    } else {
      return res.status(404).json("this user do not exist");
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

module.exports = {
  register,
  sendCode,
  resendCode,
  checkCodeNewUser,
  login,
  autoLogin,
  forgotPassword,
  sendPassword,
  modifyPassword,
  update,
  deleteUser,
  getAll,
  getById,
  toggleNeighborhood,
  toggleOfferedService,
  toggleDemandedService,
  togglePostedStatements,
  toggleFavEvents,
  toggleFavStatements,
  registerAdmin,
  toggleCity
};
