const express = require("express");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const log = require("./lib/logger");
const getAllRoutes = require("./lib/returnAllRoutes");
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

app.get("/api", (req, res) => {
  res.send(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Hello!</title>
  </head>  
  <body style="font-family: monospace;">
    <h1>
      Vidit Stream API V1
    </h1>
    <div id="routes">
      <code>
      <ul style="font-size: 40px;font-family: monospace;">${getAllRoutes(app)
        .map(e => `<li>${e.method} /${e.path}</li>`)
        .join("")}</ul>
      </code>
    </div>
  </body>
</html>
`
  );
  // res.json({ data: getAllRoutes(app) });
});
app.listen(process.env.PORT, () => {
  log.info(`Listening on port: ${process.env.PORT}`);
});
