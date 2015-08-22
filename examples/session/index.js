// first:
// $ npm install redis
// $ redis-server

var express = require('../..');
var session = require('express-session');

var app = express();

// Populates shreq.session
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'keyboard cat'
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

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
