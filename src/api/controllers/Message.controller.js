const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Chat = require("../models/Chat.model");
const Event = require("../models/Event.model");
const Message = require("../models/Message.model");
const Service = require("../models/Service.model");
const Statement = require("../models/Statement.model");
const User = require("../models/User.model");

const createMessage = async (req, res, next) => {
  try {
    const { type, images } = req.body;
    const { id } = req.params;
    let catchImages = req.files?.map((image) => image.path);

    const findUser = await User.findById(id);
    if (type == "private") {
      if (findUser) {
        const newMessage = new Message(req.body);

        newMessage.recipientUser = id;
        newMessage.images = catchImages;
        newMessage.owner = req.user;
        const savedMessage = await newMessage.save();

        try {
          const chatExistOne = await Chat.findOne({
            userOne: req.user._id,
            userTwo: findUser._id,
          });

          const chatExistTwo = await Chat.findOne({
            userOne: findUser._id,
            userTwo: req.user._id,
          });

          if (chatExistOne != null || chatExistTwo != null) {
            if (chatExistOne) {
              try {
                await chatExistOne.updateOne({
                  $push: { messages: newMessage._id },
                });

                try {
                  await User.findByIdAndUpdate(req.user._id, {
                    $push: {
                      postedMessages: newMessage._id,
                    },
                  });
                  try {
                    await User.findByIdAndUpdate(id, {
                      $push: {
                        receivedMessages: newMessage._id,
                      },
                    });
                    return res.status(200).json({
                      chat: await Chat.findById(chatExistOne._id),
                      comment: newMessage,
                    });
                  } catch (error) {
                    return res.status(404).json({
                      error: "receivedMessages key wasn't updated",
                      idMessage: newMessage._id,
                    });
                  }
                } catch (error) {
                  return res.status(404).json({
                    error: "postedMenssages key wasn't updated",
                    idMessage: newMessage._id,
                  });
                }
              } catch (error) {
                try {
                  await Message.findByIdAndDelete(savedMessage._id);
                  if (req.files) {
                    req.files.forEach((image) =>
                      deleteImgCloudinary(image.path)
                    );
                  }
                  return res
                    .status(404)
                    .json("error to update the chat, comment deleted");
                } catch (error) {
                  if (req.files) {
                    req.files.forEach((image) =>
                      deleteImgCloudinary(image.path)
                    );
                  }
                  return res.status(404).json({
                    idCommentNoDeleted: newMessage._id,
                    error: "nor comment and chat not deleted",
                  });
                }
              }
            } else if (chatExistTwo) {
              try {
                await chatExistTwo.updateOne({
                  $push: { messages: newMessage._id },
                });

                try {
                  await User.findByIdAndUpdate(req.user._id, {
                    $push: {
                      postedMessages: newMessage._id,
                    },
                  });
                  try {
                    await User.findByIdAndUpdate(id, {
                      $push: {
                        receivedMessages: newMessage._id,
                      },
                    });
                    return res.status(200).json({
                      chat: await Chat.findById(chatExistTwo._id),
                      comment: newMessage,
                    });
                  } catch (error) {
                    return res.status(404).json({
                      error: "receivedMessages key wasn't updated",
                      idMessage: newMessage._id,
                    });
                  }
                } catch (error) {
                  return res.status(404).json({
                    error: "postedMenssages key wasn't updated",
                    idMessage: newMessage._id,
                  });
                }
              } catch (error) {
                try {
                  await Message.findByIdAndDelete(savedMessage._id);
                  if (req.files) {
                    req.files.forEach((image) =>
                      deleteImgCloudinary(image.path)
                    );
                  }
                  return res
                    .status(404)
                    .json("error to update the chat, comment deleted");
                } catch (error) {
                  if (req.files) {
                    req.files.forEach((image) =>
                      deleteImgCloudinary(image.path)
                    );
                  }
                  return res
                    .status(404)
                    .json("nor comment and chat not deleted");
                }
              }
            }
          } else {
            const newChat = new Chat({
              userOne: req.user._id,
              userTwo: findUser._id,
              messages: [savedMessage._id],
            });

            try {
              await newChat.save();

              try {
                await User.findByIdAndUpdate(req.user._id, {
                  $push: {
                    postedMessages: newMessage._id,
                    chats: newChat._id,
                  },
                });

                try {
                  await User.findByIdAndUpdate(id, {
                    $push: {
                      receivedMessages: newMessage._id,
                      chats: newChat._id,
                    },
                  });

                  return res.status(200).json({
                    chat: newChat,
                    comment: newMessage,
                  });
                } catch (error) {
                  return res.status(404).json({
                    error: "chat key was not updated in user",
                    idMessage: newMessage._id,
                  });
                }
              } catch (error) {
                return res.status(404).json({
                  error: "chat & postedmessages keys was not updated in user",
                  idMessage: newMessage._id,
                });
              }
            } catch (error) {
              try {
                await Message.findByIdAndDelete(savedMessage._id);
                return res.status(404).json(error.message);
              } catch (error) {
                if (req.files) {
                  req.files.forEach((image) => deleteImgCloudinary(image.path));
                }
                return res
                  .status(404)
                  .json("chat not created & message not deleted");
              }
            }
          }
        } catch (error) {
          if (req.files) {
            req.files.forEach((image) => deleteImgCloudinary(image.path));
          }
          return res.status(404).json(error.message);
        }
      } else {
        if (req.files) {
          req.files.forEach((image) => deleteImgCloudinary(image.path));
        }
        return res.status(404).json("wrong id");
      }
    } else if (type == "event") {
      const newMessage = new Message(req.body);
      newMessage.recipientEvent = [id];
      newMessage.images = catchImages;
      newMessage.owner = req.user;
      try {
        const savedMessage = await newMessage.save();
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: {
              eventsComments: savedMessage._id,
            },
          });
          try {
            await Event.findByIdAndUpdate(id, {
              $push: {
                comments: savedMessage._id,
              },
            });
            return res.status(200).json({
              event: await Event.findById(id),
              comment: savedMessage,
            });
          } catch (error) {
            return res.status(404).json({
              error: "Comments key was not updated",
              idMessage: newMessage._id,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "eventComments key was not updated",
            idMessage: newMessage._id,
          });
        }
      } catch (error) {
        if (req.files) {
          req.files.forEach((image) => deleteImgCloudinary(image.path));
        }
        return res.status(404).json({
          error: "message was not created",
          idMessage: newMessage._id,
        });
      }
    } else if (type == "statement") {
      const newMessage = new Message(req.body);
      newMessage.recipientStatement = [id];
      newMessage.images = catchImages;
      newMessage.owner = req.user;
      try {
        const savedMessage = await newMessage.save();
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: {
              statementsComments: savedMessage._id,
            },
          });
          try {
            await Statement.findByIdAndUpdate(id, {
              $push: {
                comments: savedMessage._id,
              },
            });
            try {
              await Service.findByIdAndUpdate(id, {
                $push: {
                  comments: savedMessage._id,
                },
              });
              return res.status(200).json({
                service: await Service.findById(id),
                comment: savedMessage,
              });
            } catch (error) {
              return res.status(404).json({
                error: "Comments key was not updated",
                idMessage: newMessage._id,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: "Comments key was not updated",
              idMessage: newMessage._id,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "statementsComments key was not updated",
            idMessage: newMessage._id,
          });
        }
      } catch (error) {
        if (req.files) {
          req.files.forEach((image) => deleteImgCloudinary(image.path));
        }
        return res.status(404).json({
          error: "message was not created",
          idMessage: newMessage._id,
        });
      }
    } else if (type == "service") {
      const newMessage = new Message(req.body);
      newMessage.recipientService = [id];
      newMessage.images = catchImages;
      newMessage.owner = req.user._id;
      console.log("🚀 ~ createMessage ~ newMessage:", newMessage);
      try {
        const savedMessage = await newMessage.save();
        try {
          await User.findByIdAndUpdate(req.user._id, {
            $push: {
              servicesComments: savedMessage._id,
            },
          });
          try {
            await Service.findByIdAndUpdate(id, {
              $push: {
                comments: savedMessage._id,
              },
            });
            return res.status(200).json({
              message: await Event.findById(id),
              comment: savedMessage,
            });
          } catch (error) {
            return res.status(404).json({
              error: "Comments key was not updated",
              idMessage: newMessage._id,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "servicesComments key was not updated",
            idMessage: newMessage._id,
          });
        }
      } catch (error) {
        if (req.files) {
          req.files.forEach((image) => deleteImgCloudinary(image.path));
        }
        return res.status(404).json({
          message: "message was not created",
          error: error.message,
        });
      }
    } else {
      if (req.files) {
        req.files.forEach((image) => deleteImgCloudinary(image.path));
      }
      return res.status(404).json("can't create any type of message/comment");
    }
  } catch (error) {
    if (req.files) {
      console.log("🚀 ~ createMessage ~ req.files:", req.files);

      req.files.forEach((image) => deleteImgCloudinary(image.path));
    }
    return res.status(404).json(error.message);
  }
};

const getByIdMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messageById = await Message.findById(id).populate(
      "recipientEvent recipientService recipientUser recipientStatement"
    );
    if (messageById) {
      return res.status(200).json(await Message.findById(id).populate());
    } else {
      return res.status(404).json("no se ha encontrado el mensaje");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

const updateMessage = async (req, res, next) => {
  let catchImgs = req?.files?.map((file) => file.path);
  try {
    await Message.syncIndexes();
    const { id } = req.params;
    const MessageById = await Message.findById(id);

    let catchImgs = req?.files?.map((file) => file.path);

    if (MessageById) {
      if (req.files) {
        MessageById.images.forEach((image) => deleteImgCloudinary(image));

        const customBody = {
          content: req.body?.content ? req.body?.content : MessageById.content,
          images: catchImgs
            ? (MessageById.images = catchImgs)
            : MessageById.images,
        };
        try {
          await Message.findByIdAndUpdate(id, customBody);
          return res.status(200).json("Message update ok");
        } catch (error) {
          catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
          return res.status(404).json("cannot update Message");
        }
      } else {
        const customBody = {
          content: req.body?.content ? req.body?.content : MessageById.content,
        };
        try {
          await Message.findByIdAndUpdate(id, customBody);
          return res.status(200).json("Message update ok");
        } catch (error) {
          catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
          return res.status(404).json("cannot update Message");
        }
      }
    } else {
      catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
      return res.status(404).json("Message not exist");
    }
  } catch (error) {
    catchImgs && catchImgs.forEach((image) => deleteImgCloudinary(image));
    return res.status(404).json(error);
  }
};

const deleteMessege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messageDelete = await Message.findById(id);
    const { type, owner, recipientUser } = messageDelete;

    const images = messageDelete.images;
    await Message.findByIdAndDelete(id);
    images.forEach((image) => {
      deleteImgCloudinary(image);
    });

    if (await Message.findById(id)) {
      return res.status(404).json("message not deleted");
    } else if (type == "service") {
      try {
        await User.updateMany(
          { servicesComments: id },
          { $pull: { servicesComments: id } }
        );
        try {
          await Service.updateMany(
            { comments: id },
            { $pull: { comments: id } }
          );
          return res.status(200).json("comments key updated");
        } catch (error) {
          return res
            .status(404)
            .json("comments key was not updated in service");
        }
      } catch (error) {
        return res.status(404).json("serviceComents was not updated un user");
      }
    } else if (type == "event") {
      try {
        await User.updateMany(
          { eventsComments: id },
          { $pull: { eventsComments: id } }
        );
        try {
          await Event.updateMany({ comments: id }, { $pull: { comments: id } });
          return res.status(200).json("EventsComments key updated");
        } catch (error) {
          return res.status(404).json("comments in event was not updated");
        }
      } catch (error) {
        return res.status(404).json("eventsComments in user was not updated");
      }
    } else if (type == "statement") {
      try {
        await User.updateMany(
          { statementsComments: id },
          { $pull: { statementsComments: id } }
        );
        try {
          await Statement.updateMany(
            { comments: id },
            { $pull: { comments: id } }
          );
          return res.status(200).json("comments key updated");
        } catch (error) {
          return res.status(404).json("comments in statement was not updated");
        }
      } catch (error) {
        return res
          .status(404)
          .json("statementsComments was not updated in user");
      }
    } else if (type == "private") {
      try {
        await User.findByIdAndUpdate(owner, { $pull: { postedMessages: id } });

        try {
          await User.findByIdAndUpdate(recipientUser, {
            $pull: { receivedMessages: id },
          });

          try {
            const chatExistOne = await Chat.findOne(
              { userOne: [req.user._id] },
              { userTwo: [recipientUser] }
            );

            const chatExistTwo = await Chat.findOne(
              { userOne: [recipientUser] },
              { userTwo: [req.user._id] }
            );

            if (chatExistOne) {
              try {
                await chatExistOne.updateOne({
                  $pull: { messages: id },
                });
                return res.status(200).json("message deleted in chat");
              } catch (error) {
                return res
                  .status(404)
                  .json("Message was not deleted from chat");
              }
            } else if (chatExistTwo) {
              try {
                await chatExistTwo.updateOne({
                  $pull: { messages: id },
                });
                return res.status(200).json("message deleted in chat");
              } catch (error) {
                return res
                  .status(404)
                  .json("Message was not deleted from chat");
              }
            } else {
              return res.status(404).json("chat do not exist");
            }
          } catch (error) {
            return res.status(404).json("message not deleted in chat");
          }
        } catch (error) {
          return res
            .status(404)
            .json("Received message was not updated in recipientUser");
        }
      } catch (error) {
        return res
          .status(404)
          .json("Posted message was not updated in ownerUser");
      }
    } else {
      return res.status(404).json("Message not found");
    }
  } catch (error) {
    return next(error);
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    const allMessages = await Message.find().populate(
      "recipientEvent recipientService recipientUser recipientStatement"
    );

    if (allMessages.length > 0) {
      return res.status(200).json(allMessages);
    } else {
      return res.status(404).json("messages not found");
    }
  } catch (error) {
    return res.status(404).json({
      error: "get messages error",
      message: error.message,
    });
  }
};

module.exports = {
  createMessage,
  updateMessage,
  deleteMessege,
  getAllMessages,
  getByIdMessage,
};
