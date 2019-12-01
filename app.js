const express = require("express"),
  app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const log = require("./lib/logger");
const getAllRoutes = require("./lib/returnAllRoutes");
const User = require("./api/models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGOOSEURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection Error: "));

const usersRouter = require("./api/routes/users");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
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
    <script src="/socket.io/socket.io.js"></script>
    <script>
  var socket = io('http://localhost:6969/chat');
  socket.on('connect', function () {

    socket.on('message', function (msg) {
      // my msg
      console.log(msg);
    });
    socket.on('disconnect', function (msg) {
      // my msg
      console.log('disconnected');
      socket.disconnect();
    });
  });
</script>
  </body>
</html>
`
  );
  // res.json({ data: getAllRoutes(app) });
});

// Socket io fuckery
let usersInChat = new Map();
const chat = io.of("/chat"),
  stream = io.of("/stream");

stream.on("connection", socket => {
  socket.join("stream");
  log.info(`${usersInChat.size} users in chat.`);
  socket.on("getTimeStamp", ({ token, timestamp }) => {
    try {
      const sekret = jwt.verify(token, process.env.JWT_SECRET);
      if (sekret.userID == process.env.ADMIN)
        socket.to("stream").emit("getTS", timestamp);
    } catch (e) {
      return;
    }
  });
  socket.on("getPauseState", token => {
    const sekret = jwt.verify(token, process.env.JWT_SECRET);
    if (sekret.userID == process.env.ADMIN) socket.to("stream").emit("pause");
  });
  socket.on("getPlayState", token => {
    const sekret = jwt.verify(token, process.env.JWT_SECRET);
    if (sekret.userID == process.env.ADMIN) socket.to("stream").emit("play");
  });
  socket.on("toggleSS", (state, token) => {
    console.log(state);
    console.log("toggle");
    try {
      const sekret = jwt.verify(token, process.env.JWT_SECRET);
      if (sekret.userID == process.env.ADMIN)
        socket.to("stream").emit("playState", state);
    } catch (e) {
      return;
    }
  });
});
let bitch;
chat.on("connection", socket => {
  socket.join("chat");
  // Testing
  socket.on("NIGGERS420", () => {
    console.log("NEW MESSAGE REQUESTED. SENT ONE TO EVERYOEN");
    chat.in("chat").emit("message", {
      username: "owo",
      message: "hiowo",
      avatar:
        "https://cdn.discordapp.com/attachments/327869408389365760/647342810541981716/o891e4zwe0041.png",
      ts: new Date()
    });
  });
  // end testing
  log.info("User Connected to Chat.");
  socket.once("authenticate", (user, cb) => {
    try {
      const sekret = jwt.verify(user.token, process.env.JWT_SECRET);
      console.log();
      usersInChat.set(socket.client.id, sekret.userID);
      cb(sekret);
    } catch (e) {
      socket.disconnect(true);
    }
  });
  socket.on("sendMsg", (token, message) => {
    let user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(message);
    console.log(usersInChat);
    console.log({ _id: socket.client.id, id: user.userID });
    if (usersInChat.has(socket.client.id)) {
      console.log("IN DATABASE");
      log.info(`${user.username}: ${message}`);
      bitch = Date.now();
      User.find({ username: user.username })
        .exec()
        .then(_user => {
          chat.in("chat").emit("message", {
            username: user.username,
            message: message,
            avatar: _user[0].avatar,
            ts: new Date().toUTCString()
          }); // TODO: Fix XSS Issue here
        })
        .catch(err => apiRes.error(res, err));
    }
  });
  socket.on("getAllUsers", cb => {
    const arrayConstruct = [];
    for (let [key, value] of usersInChat) {
      arrayConstruct.push({ _id: key, id: value });
    }
    cb(arrayConstruct);
  });
  socket.on("disconnect", () => {
    usersInChat.delete(socket.client.id);
  });
});
// end socketio
server.listen(process.env.PORT);
