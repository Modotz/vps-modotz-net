var request = require("request");
var querystring = require("querystring");
var http = require("http");
var path = require("path");
const Users = require("../models/usersModel");

exports.signup = async (req, res) => {
  try {
    console.log('signup');
    console.log(req.body);
    const email = req.body.email;
    var user = await Users.findOne({email : email});
    if(user){
    }else{
      var data = {
        name: req.body.name,
        email: req.body.email,
        telepon: null,
        role: 'member',
        password: req.body.password,
        avatar: null,
        status: 'active'
      };
      await Users.create(data);
    }
    res.redirect("/");
  } catch (err) {
    console.log('error:', err)
    res.redirect("/");
  }
};