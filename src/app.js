const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("express-async-errors");
require("dotenv").config();

const middlewares = require("./middlewares");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from the feedback server",
    status: "success",
    currentTime: new Date().toISOString(),
    path: req.path,
    url: req.originalUrl,
  });
});

const authRouter = require("./router/auth");
const feedbackRouter = require("./router/feedback");
app.use("/api/v1/oauth/", authRouter);
app.use("/api/v1/feedback/", feedbackRouter);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;

