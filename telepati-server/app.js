var createError = require("http-errors");
var express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var http = require("http");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const shortid = require("shortid");
const mongoose = require("mongoose");
const Rooms = require("./models/roomsModel");

// insert your own ssl certificate and keys
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

mongoose.set("strictQuery", true);
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dbtelepati",
  {
    useNewUrlParser: true,
    //useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to MongoDB");
    }
  }
);

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var membersRouter = require("./routes/members");
var usersRouter = require("./routes/users");
var roomsRouter = require("./routes/rooms");

var meetingsApiRouter = require("./api/routes/meetings");

var app = express();
/**
 * Get port from environment and store in Express.
 */
//global.ServerHost = "http://localhost"; // rumah
//global.ServerHost = "https://192.168.100.5"; // rumah
global.ServerHost = "https://192.168.18.139"; // rumah

var port = process.env.PORT || 1987;
app.set("port", port);
//const server = http.createServer(app);
const server = https.createServer(options, app);

const io = require("socket.io")(server,{
  cors: {
      origin: "*",
    },
});


//app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// Express Session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);
// Flash Messages

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);

// Templating Engine
app.set("layout", "./layouts/layout_admin");
app.use(expressLayout);

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/members", membersRouter);
app.use("/users", usersRouter);
app.use("/rooms", roomsRouter);

app.use("/api/meetings", meetingsApiRouter);

//==================================================

let rooms = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  // add new client to array clientList

  socket.on("create-room", (data) => {
    console.log("User :" + data.username + " create room");
    var room = rooms.filter(function (item) {
      return item.room === data.room;
    });
    if (room.length > 0) {
      console.log("room sudah ada");
      io.to(data.client_id).emit("#room-available");
    } else {
      console.log("room tersedia");
      rooms.push(data);
    }
    console.log("Rooms");
    console.table(rooms);
  });

  socket.on("join-room", async (data) => {
    console.log("join-room :", data);

    await Rooms.updateOne(
      {
        room_id: data.room_id,
        "participants.client_id": data.client_id,
      },
      { $set: { "participants.$.status": true } }
    );

    var room = await Rooms.findOne({room_id: data.room_id})
    room.participants.forEach(item => {
      if (item.client_id !== data.client_id) {
        io.to(item.client_id).emit("pre-offer", data);
      }
    });
  });

  socket.on("pre-offer-answer", (data) => {
    console.log("pre-offer-answer", data.from_client_id);
    io.to(data.to_client_id).emit("#pre-offer-answer", data);
  });

  socket.on("webRTC-signaling", (data) => {
    io.to(data.to_client_id).emit("webRTC-signaling", data);
  });

  socket.on("clear-room", (data) => {
    console.log("Clear Rooms");
    console.log("User :" + data.username + " clear room: " + data.room);
    rooms = [];
  });

  socket.on("mute-all", (client_id) => {
    var audiance = rooms.filter(function (item) {
      return item.client_id !== client_id;
    });
    audiance.forEach((item) => {
      io.to(item.client_id).emit("on-mute-all");
    });
  });

  socket.on("screen-sharing", (client_id) => {
    console.log("screen-sharing");
    rooms.forEach((item) => {
      console.log(item.client_id);
      io.to(item.client_id).emit("#screen-sharing", client_id);
    });
  });

  socket.on("stop-screen-sharing", (client_id) => {
    console.log("stop-screen-sharing");
    rooms.forEach((item) => {
      console.log(item.client_id);
      io.to(item.client_id).emit("#stop-screen-sharing", client_id);
    });
  });

  socket.on("kickoff", (client_id) => {
    console.log("kickoff");
  });

  socket.on("close-room", (data) => {
    console.log("close-room");
    console.log("User :" + data.username + " clear room: " + data.room);
    rooms = [];
  });

  socket.on("user-hanged-up", (client_id) => {
    var audiance = rooms.filter(function (item) {
      return item.client_id !== client_id;
    });
    audiance.forEach((item) => {
      console.log(item.client_id);
      console.log("user-hanged-up :", item.client_id);
      io.to(item.client_id).emit("#user-hanged-up", client_id);
    });
    console.table(rooms);
  });

  socket.on("disconnect", async () => {
    console.log("disconnect");
    // var room = await Rooms.aggregate([
    //   { $unwind: "$participants" },
    //   { $match: { "participants.client_id": socket.id } },
    // ]);

    var room = await Rooms.findOne({
      "participants.client_id": socket.id,
    });

    if (room) {
      room.participants.forEach((item) => {
        if (item.client_id == socket.id) {
          // delete participant from list
          Rooms.updateOne(
            { _id: room._id },
            { $pull: { participants: { client_id: socket.id } } },
            function (error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log("Delete :", socket.id);
              }
            }
          );
        } else {
          //notif to all participants connected
          console.log("Notif to :", item.client_id);
          io.to(item.client_id).emit("user-hanged-up", socket.id);
        }
      });
    }
  });
});

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(port, () => {
  console.log(`listening on ${ServerHost}:${port}`);
});

module.exports = app;
