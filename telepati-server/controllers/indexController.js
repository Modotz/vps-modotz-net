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
      res.redirect("/"+room_id);
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
      res.redirect("/"+newRoomId);
    }
  } catch (err) {
    console.log("error:", err);
    res.redirect("/");
  }
};

exports.startMeeting = async (req, res) => {
  try {
    const room_id = req.params.id;
    var room = await Rooms.findOne({ room_id: room_id });
    if (room) {
      // var participant = {
      //   client_id: "",
      //   username: "Modotz",
      //   host: true,
      //   status: true,
      // };

      // Rooms.findOneAndUpdate(
      //   { _id: room._id },
      //   { $push: { participants: participant } },
      //   function (error, success) {
      //     if (error) {
      //       console.log(error);
      //     } else {
      //       //console.log(success);
      //       console.log("success");
      //     }
      //   }
      // );

      var locals = {
        title : 'Telepati',
        description : 'Meeting wong jowo',
        pages : 'Meeting Rooms',
      }

      res.render("meet", {layout: false, room_id, locals });
    } else {
      res.render("meet", {layout: false, title: room_id });
    }
  } catch (err) {
    console.log("error:", err);
    res.redirect("/");
  }
};


exports.joinMeeting = async (req, res) => {
  try {
    const room_id = req.body.room_id;
    const client_id = req.body.client_id;
    const username = req.body.username;
    var room = await Rooms.findOne({ room_id: room_id });
    if (room) {
      var participant = {
        client_id: client_id,
        username: username,
        host: false,
        status: true,
      };
      console.log("join Meeting :", participant);
      Rooms.findOneAndUpdate(
        { _id: room._id },
        { $push: { participants: participant } },
        function (error, success) {
          if (error) {
            console.log(error);
            res.status(500).json({ error: error });
          } else {
            //console.log(success);
            console.log("success");
            res.status(200).json({ room: success });
          }
        }
      );

    } else {
      res.status(404).json({ error: 'not found' });
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

