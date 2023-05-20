var request = require("request");
var querystring = require("querystring");
var http = require("http");
var path = require("path");
const Rooms = require("../models/rooms_model");

exports.meet = async (req, res) => {
  try {
    const room_id = req.body.room_id;
    var room = await Rooms.findOne({ room_id: room_id });
    if (room) {
      console.log("join room:", room_id);
      var participant = {
        client_id: "",
        username: "Indra",
        host: false,
        status: true,
      };

      Rooms.findOneAndUpdate(
        { _id: room._id },
        { $push: { participants: participant } },
        function (error, success) {
          if (error) {
            console.log(error);
          } else {
            //console.log(success);
            console.log("success");
          }
        }
      );
    } else {
      console.log("create room:", room_id);
      var randId = randomId(6);
      var participant = {
        client_id: "",
        username: "Modotz",
        host: true,
        status: true,
      };

      var data = {
        room_id: room_id ? room_id : randId,
        password: null,
        topic: null,
        start_time: null,
        end_time: null,
        participants: participant,
        status: true,
      };
      await Rooms.create(data);
    }
  } catch (err) {
    console.log("error:", err);
    res.redirect("/");
  }
};

const randomId = function (length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};
