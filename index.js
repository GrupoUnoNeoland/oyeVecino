const express = require("express");
const dotenv = require("dotenv");
const { connect } = require("./src/utils/db");

const app = express();

dotenv.config();

connect();

const { configCloudinary } = require("./src/middleware/files.middleware");
configCloudinary();

const PORT = process.env.PORT;

const cors = require("cors");
app.use(cors());

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));

const UserRoutes = require("./src/api/routes/User.routes");
app.use("/api/v1/users/", UserRoutes);

const EventRoutes = require("./src/api/routes/Event.routes");
app.use("/api/v1/events/", EventRoutes);

const StatementRoutes = require("./src/api/routes/Statement.routes");
app.use("/api/v1/statements/", StatementRoutes);

const NeighborhoodRoutes = require("./src/api/routes/Neighborhood.routes");
app.use("/api/v1/neighborhoods/", NeighborhoodRoutes);

const ServiceRoutes = require("./src/api/routes/Service.routes");
app.use("/api/v1/services/", ServiceRoutes);

const MessageRoutes = require("./src/api/routes/Message.routes");
app.use("/api/v1/messages/", MessageRoutes);

const RatingRoutes = require("./src/api/routes/Rating.routes");
app.use("/api/v1/rating/", RatingRoutes);

const CityRoutes = require("./src/api/routes/City.routes");
app.use("/api/v1/cities/", CityRoutes);

const RequestRoutes = require("./src/api/routes/Request.routes");
app.use("/api/v1/requests/", RequestRoutes);

app.use("*", (req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  return next(error);
});

app.use((error, req, res) => {
  return res
    .status(error.status || 500)
    .json(error.message || "unexpected error");
});

app.disable("x-powered-by");
app.listen(PORT, () =>
  console.log(`Server listening on port 👌🔍 http://localhost:${PORT}`)
);
