/**
 * Module dependencies.
 */

var db = require('../../db');

exports.before = function(shreq, res, next){
  var id = shreq.params.user_id;
  if (!id) return next();
  // pretend to query a database...
  process.nextTick(function(){
    shreq.user = db.users[id];
    // cant find that user
    if (!shreq.user) return next('route');
    // found it, move on to the routes
    next();
  });
};

exports.list = function(shreq, res, next){
  res.render('list', { users: db.users });
};

exports.edit = function(shreq, res, next){
  res.render('edit', { user: shreq.user });
};

exports.show = function(shreq, res, next){
  res.render('show', { user: shreq.user });
};

exports.update = function(shreq, res, next){
  var body = shreq.body;
  shreq.user.name = body.user.name;
  res.message('Information updated!');
  res.redirect('/user/' + shreq.user.id);
};
