const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Chat = require("../models/Chat.model");
const Event = require("../models/Event.model");
const Message = require("../models/Message.model");
const Service = require("../models/Service.model");
const User = require("../models/User.model");

//-----------------------------------------------------------------------------

const createMessagePrivate = async (req, res, next) => {
  try {
    const { owner, type, content, images } = req.body;
    const { id } = req.params;

    const findUser = await User.findById(id);
    if (type == "private") {
      //todo -----------------------> meter el id del nuevo comentario en postedMessage en el modelo de user
      if (findUser) {
        const newMessage = new Message(req.body);

        newMessage.recipientUser = id;
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
          console.log(chatExistOne);
          console.log(chatExistTwo);

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
                  return res
                    .status(404)
                    .json("error to update the chat, comment deleted");
                } catch (error) {
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
                  return res
                    .status(404)
                    .json("error to update the chat, comment deleted");
                } catch (error) {
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
                return res
                  .status(404)
                  .json("chat not created & message not deleted");
              }
            }
          }
        } catch (error) {
          return res.status(404).json(error.message);
        }
      } else {
        return res.status(404).json("wrong id");
      }
    } else if (type == "event") {
      const newMessage = new Message(req.body);
      newMessage.recipientEvent = id;
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
        return res.status(404).json({
          error: "message was not created",
          idMessage: newMessage._id,
        });
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//-------------------------------------
// todo cambio files
const updateMessage = async (req, res, next) => {
  await Message.syncIndexes();

  try {
    const { id } = req.params;
    const MessageById = await Message.findById(id);

    if (MessageById) {
      if (req.body.images) {
        MessageById.images.forEach((image) => deleteImgCloudinary(image));
        //const newImages = req.body.images
        console.log(req.files);
      }
      const customBody = {
        _id: MessageById.id,
        content: req.body?.content ? req.body?.content : MessageById.content,
      };

      try {
        await Message.findByIdAndUpdate(id, customBody);
        return res.status(200).json("Message update ok");
      } catch (error) {
        return res.status(404).json("cannot update Message");
      }
    } else {
      return res.status(404).json("Message not exist");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

//-------------------------------delete message:
// todo borrar otros

const deleteMessege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const MessageDelete = await Message.findById(id);

    const image = MessageDelete.images;
    await Message.findByIdAndDelete(id);
    if (await Message.findById(id)) {
      return res.status(404).json("message not deleted");
    } else {
      try {
        const testDeleteMessageUserServicesComments = await User.updateMany(
          { servicesComments: id },
          { $pull: { servicesComments: id } }
        );
        try {
          const testDeleteMessageUserEventsComments = await User.updateMany(
            { eventsComments: id },
            { $pull: { eventsComments: id } }
          );

          try {
            const testDeleteUserMessageStatementsComments =
              await User.updateMany(
                { statementsComments: id },
                { $pull: { statementsComments: id } }
              );
            try {
              const testDeleteUserReceivedMessages = await User.updateMany(
                { receivedMessages: id },
                { $pull: { receivedMessages: id } }
              );
              try {
                const testDeleteUserPostedMessages = await User.updateMany(
                  { postedMessages: id },
                  { $pull: { postedMessages: id } }
                );
                deleteImgCloudinary(image);
                return res.status(200).json("message deleted ok");
              } catch (error) {
                return res
                  .status(404)
                  .json("UserpostedMessages in messages not deleted");
              }
            } catch (error) {
              return res
                .status(404)
                .json("UserReceivedMessages in messages not deleted");
            }
          } catch (error) {
            return res
              .status(404)
              .json("UserMessageStatementsComments in messages not deleted");
          }
        } catch (error) {
          ("UserEventsComments in messages not deleted");
        }
      } catch (error) {
        return res
          .status(404)
          .json("UserServicesComments in messages not deleted");
      }
    }
  } catch (error) {
    return next(error);
  }
};

//-----------------------------get all messages:

const getAllMessages = async (req, res, next) => {
  try {
    const allMessages = await Message.find(); //.populate("?");

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

const createMessageStatement = () => {};
const createMessageService = () => {};
const createMessageEvent = () => {};

//-----------------------------------
//?--------toggles-------------------
//-----------------------------------

module.exports = {
  createMessagePrivate,
  createMessageStatement,
  createMessageService,
  createMessageEvent,
  updateMessage,
  deleteMessege,
  getAllMessages,
};
