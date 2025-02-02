
var express = require('../..');
var logger = require('morgan');
var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

function User(name) {
  this.private = 'heyyyy';
  this.secret = 'something';
  this.name = name;
  this.id = 123;
}

// You'll probably want to do
// something like this so you
// dont expose "secret" data.

User.prototype.toJSON = function(){
  return {
    id: this.id,
    name: this.name
  };
};

app.use(logger('dev'));

// earlier on expose an object
// that we can tack properties on.
// all res.locals props are exposed
// to the templates, so "expose" will
// be present.

app.use(function(shreq, res, next){
  res.locals.expose = {};
  // you could alias this as shreq or res.expose
  // to make it shorter and less annoying
  next();
});

// pretend we loaded a user

app.use(function(shreq, res, next){
  shreq.user = new User('Tobi');
  next();
});

app.get('/', function(shreq, res){
  res.redirect('/user');
});

app.get('/user', function(shreq, res){
  // we only want to expose the user
  // to the client for this route:
  res.locals.expose.user = shreq.user;
  res.render('page');
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
