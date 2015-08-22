/**
 * Module dependencies.
 */

var express = require('../../');
var app = module.exports = express();

// Faux database

var users = [
    { name: 'tj' }
  , { name: 'tobi' }
  , { name: 'loki' }
  , { name: 'jane' }
  , { name: 'bandit' }
];

// Create HTTP error

function createError(status, message) {
  var err = new Error(message);
  err.status = status;
  return err;
}

// Convert :to and :from to integers

app.param(['to', 'from'], function(shreq, res, next, num, name){
  shreq.params[name] = parseInt(num, 10);
  if( isNaN(shreq.params[name]) ){
    next(createError(400, 'failed to parseInt '+num));
  } else {
    next();
  }
});

// Load user by id

app.param('user', function(shreq, res, next, id){
  if (shreq.user = users[id]) {
    next();
  } else {
    next(createError(404, 'failed to find user'));
  }
});

/**
 * GET index.
 */

app.get('/', function(shreq, res){
  res.send('Visit /user/0 or /users/0-2');
});

/**
 * GET :user.
 */

app.get('/user/:user', function(shreq, res, next){
  res.send('user ' + shreq.user.name);
});

/**
 * GET users :from - :to.
 */

app.get('/users/:from-:to', function(shreq, res, next){
  var from = shreq.params.from;
  var to = shreq.params.to;
  var names = users.map(function(user){ return user.name; });
  res.send('users ' + names.slice(from, to).join(', '));
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
