var createError = require('http-errors');
var express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const  flash = require('express-flash-message');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const shortid = require("shortid");
const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
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


var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var membersRouter = require('./routes/members');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  })
);
// Flash Messages

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", require("ejs").__express);

// Templating Engine
app.set('layout', './layouts/layout_admin')
app.use(expressLayout);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/members', membersRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


/**
 * Get port from environment and store in Express.
 */

//global.ServerHost = "http://localhost"; // rumah
global.ServerHost = "http://192.168.100.3"; // rumah

var port = process.env.PORT || 1987;
app.set('port', port);
var server = http.createServer(app);
server.listen(port, () => {  console.log(`listening on ${ServerHost}:${port}`); });

module.exports = app;
