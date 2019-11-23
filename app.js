const express = require("express");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const log = require("./lib/logger");
require("dotenv").config();

mongoose.connect(process.env.MONGOOSEURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection Error: "));

const usersRouter = require("./api/routes/users");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/users", usersRouter);

app.listen(process.env.PORT, () => {
  log.info(`Listening on port: ${process.env.PORT}`);
});
