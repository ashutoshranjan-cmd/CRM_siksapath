const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const env = require("./config/env");
const { apiLimiter, authLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");
const sanitizeRequest = require("./middlewares/sanitize.middleware");
const routes = require("./routes");

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
};

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: env.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.bodyLimit }));
app.use(sanitizeRequest);
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
