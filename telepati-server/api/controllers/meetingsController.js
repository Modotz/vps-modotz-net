var request = require("request");
var querystring = require("querystring");
var http = require("http");
var path = require("path");
const Rooms = require("../../models/roomsModel");

exports.getAll = async (req, res) => {
  try {
    const room_id = req.params.id;
    var rooms = await Rooms.find();
    res.status(200).json({ rooms });
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({ error: err });
  }
};

exports.getById = async (req, res) => {
  try {
    const room_id = req.params.id;
    var room = await Rooms.findOne({ room_id: room_id });
    if (room) {
      var locals = {
        title: "Telepati",
        description: "Meeting wong jowo",
        pages: "Meeting Rooms",
      };
      res.status(200).json({ room });
    } else {
      res.status(404).json({ error: "not found" });
    }
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({ error: err });
  }
};

exports.initMeeting = async (req, res) => {
  try {
    console.log("Init Meeting:");
    const room_id = req.body.room_id;
    var room = await Rooms.findOne({ room_id: room_id });
    if (room) {
      console.log("join room:", room_id);
      res.redirect("rooms/" + room_id);
      res.status(200).json({ room_status: "join room", room });
    } else {
      console.log("create room:", room_id);
      var randId = randomId(6);
      var newRoomId = room_id ? room_id : randId;
      var data = {
        room_id: newRoomId,
        password: null,
        topic: null,
        start_time: null,
        end_time: null,
        status: true,
      };
      var newRoom = await Rooms.create(data);
      res.status(200).json({ room_status: "join room", newRoom });
    }
  } catch (err) {
    console.log("error:", err);
    res.status(500).json({ error: err });
  }
};

const randomId = function (length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};
