/**
 * Module dependencies.
 */

var express = require('../..');
var logger = require('morgan');
var session = require('express-session');

// pass the express to the connect redis module
// allowing it to inherit from session.Store
var RedisStore = require('connect-redis')(session);

var app = express();

app.use(logger('dev'));

// Populates shreq.session
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'keyboard cat',
  store: new RedisStore
}));

app.get('/', function(shreq, res){
  var body = '';
  if (shreq.session.views) {
    ++shreq.session.views;
  } else {
    shreq.session.views = 1;
    body += '<p>First time visiting? view this page in several browsers :)</p>';
  }
  res.send(body + '<p>viewed <strong>' + shreq.session.views + '</strong> times.</p>');
});

app.listen(3000);
console.log('Express app started on port 3000');
