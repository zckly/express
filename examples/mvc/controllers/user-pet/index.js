/**
 * Module dependencies.
 */

var db = require('../../db');

exports.name = 'pet';
exports.prefix = '/user/:user_id';

exports.create = function(shreq, res, next){
  var id = shreq.params.user_id;
  var user = db.users[id];
  var body = shreq.body;
  if (!user) return next('route');
  var pet = { name: body.pet.name };
  pet.id = db.pets.push(pet) - 1;
  user.pets.push(pet);
  res.message('Added pet ' + body.pet.name);
  res.redirect('/user/' + id);
};
