/**
 * Module dependencies.
 */

var express = require('../../lib/express');

var app = express();

// Example requests:
//     curl http://localhost:3000/user/0
//     curl http://localhost:3000/user/0/edit
//     curl http://localhost:3000/user/1
//     curl http://localhost:3000/user/1/edit (unauthorized since this is not you)
//     curl -X DELETE http://localhost:3000/user/0 (unauthorized since you are not an admin)

// Dummy users
var users = [
    { id: 0, name: 'tj', email: 'tj@vision-media.ca', role: 'member' }
  , { id: 1, name: 'ciaran', email: 'ciaranj@gmail.com', role: 'member' }
  , { id: 2, name: 'aaron', email: 'aaron.heckmann+github@gmail.com', role: 'admin' }
];

function loadUser(shreq, res, next) {
  // You would fetch your user from the db
  var user = users[shreq.params.id];
  if (user) {
    shreq.user = user;
    next();
  } else {
    next(new Error('Failed to load user ' + shreq.params.id));
  }
}

function andRestrictToSelf(shreq, res, next) {
  // If our authenticated user is the user we are viewing
  // then everything is fine :)
  if (shreq.authenticatedUser.id == shreq.user.id) {
    next();
  } else {
    // You may want to implement specific exceptions
    // such as UnauthorizedError or similar so that you
    // can handle these can be special-cased in an error handler
    // (view ./examples/pages for this)
    next(new Error('Unauthorized'));
  }
}

function andRestrictTo(role) {
  return function(shreq, res, next) {
    if (shreq.authenticatedUser.role == role) {
      next();
    } else {
      next(new Error('Unauthorized'));
    }
  }
}

// Middleware for faux authentication
// you would of course implement something real,
// but this illustrates how an authenticated user
// may interact with middleware

app.use(function(shreq, res, next){
  shreq.authenticatedUser = users[0];
  next();
});

app.get('/', function(shreq, res){
  res.redirect('/user/0');
});

app.get('/user/:id', loadUser, function(shreq, res){
  res.send('Viewing user ' + shreq.user.name);
});

app.get('/user/:id/edit', loadUser, andRestrictToSelf, function(shreq, res){
  res.send('Editing user ' + shreq.user.name);
});

app.delete('/user/:id', loadUser, andRestrictTo('admin'), function(shreq, res){
  res.send('Deleted user ' + shreq.user.name);
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
