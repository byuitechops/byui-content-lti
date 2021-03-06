/*eslint-env node, es6*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var ltiMiddleware = require("express-ims-lti");
var session = require('express-session');
var index = require('./routes/index');
var lti = require('./routes/lti');
var api = require('./routes/api');
var https = require('https');
var fs = require('fs')
var app = express();
if (!process.env.URL) {
  https.createServer({
    pfx: fs.readFileSync('crt/crt.pfx'),
    passphrase: 'byuicontent'
  }, app).listen(1830)
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false

}));
// Session must be initialized before ltiMiddleware!
app.use(session({
  secret: 'byui-content-session',
  resave: false,
  saveUninitialized: true
}))

// LTI middleware for use
app.use(ltiMiddleware({
  consumer_key: "byui-content",
  consumer_secret: "byui-content-secret"
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index)
app.use('/lti', lti)
app.use('/api', api)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
