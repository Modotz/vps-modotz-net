const mongoose = require("mongoose");

const Rooms = new mongoose.Schema({
  room_id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  topic: {
    type: String,
    required: false,
  },
  start_time: {
    type: String,
    required: false,
  },
  end_time: {
    type: String,
    required: false,
  },
  participants: {
    type: Array,
    required: false,
  },
  status: {
    type: Boolean,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Rooms", Rooms);