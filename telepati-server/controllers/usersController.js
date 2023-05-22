var request = require("request");
var querystring = require("querystring");
var http = require("http");
var path = require("path");
const Members = require("../models/usersModel");

exports.index = async (req, res) => {
  try {
    var locals = {
      title : 'Telepati',
      description : 'Meeting wong jowo',
      pages : 'Users',
    }
    res.render("users/index", { locals });
  } catch (err) {
    console.log('error:', err)
    res.redirect("/");
  }
};