const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Email not valid"],
    },
    cif: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword], //minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    adress: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["hombre", "mujer", "otros"],
      required: true,
    },
    age: {
      type: Number,
    },
    document: {
      type: String,
    },
    adressChecked: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    openingTime: {
      type: String,
    },
    closingTime: {
      type: String,
    },
    description: {
      type: String,
    },
    telephone: {
      type: String,
    },
    points: {
      type: Number,
    },
    stars: {
      type: Number,
    },
    rol: {
      type: String,
      enum: ["vecino", "admin", "superadmin"],
      default: "vecino",
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    confirmationCodeChecked: {
      type: Boolean,
      default: false,
    },
    neighborhoods: [{ type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" }],
    servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    servicesDemanded: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    servicesComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    eventsComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    statementsComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    receivedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    postedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    statements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Statement" }],
    servicesFav: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    eventsFav: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    statementsFav: [{ type: mongoose.Schema.Types.ObjectId, ref: "Statement" }],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10)
    next()
  } catch (error) {
    next('Error hashing password', error)
  }
})

const User = mongoose.model("Usuario", UserSchema);

module.exports = User;