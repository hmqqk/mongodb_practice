var path = require('path');

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var multer  = require('multer');

var routes = require('./routes/index');
var settings = require('./settings');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(logger({stream: accessLog}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
  dest: './public/images',
  rename: function (fieldname, filename) {
    return filename;
  }
}));
app.use(cookieParser());
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave:false,
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port,
    url: 'mongodb://localhost/liuhong_practice'
  })
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);






module.exports = app;