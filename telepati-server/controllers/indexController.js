var request = require("request");
var querystring = require("querystring");
var http = require("http");
var path = require("path");
const Rooms = require("../models/roomsModel");

exports.initMeeting = async (req, res) => {
  try {
    console.log("Init Meeting:");
    const room_id = req.body.room_id;
    var room = await Rooms.findOne({ room_id: room_id });
    if (room) {
      console.log("join room:", room_id);
      res.redirect("rooms/"+room_id);
    } else {
      console.log("create room:", room_id);
      var randId = randomId(6);
      var newRoomId = room_id ? room_id : randId
      var data = {
        room_id: newRoomId,
        password: null,
        topic: null,
        start_time: null,
        end_time: null,
        status: true,
      };
      await Rooms.create(data);
      res.redirect("rooms/"+newRoomId);
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
