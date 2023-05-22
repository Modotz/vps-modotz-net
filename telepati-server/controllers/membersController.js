var request = require("request");
var querystring = require("querystring");
var http = require("http");
var path = require("path");
const Members = require("../models/membersModel");

exports.index = async (req, res) => {
  try {
    var locals = {
      title : 'Telepati',
      description : 'Meeting wong jowo',
      pages : 'Members',
    }
    res.render("members/index", { locals });
  } catch (err) {
    console.log('error:', err)
    res.redirect("/");
  }
};