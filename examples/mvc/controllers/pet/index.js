/**
 * Module dependencies.
 */

var db = require('../../db');

exports.engine = 'ejs';

exports.before = function(shreq, res, next){
  var pet = db.pets[shreq.params.pet_id];
  if (!pet) return next('route');
  shreq.pet = pet;
  next();
};

exports.show = function(shreq, res, next){
  res.render('show', { pet: shreq.pet });
};

exports.edit = function(shreq, res, next){
  res.render('edit', { pet: shreq.pet });
};

exports.update = function(shreq, res, next){
  var body = shreq.body;
  shreq.pet.name = body.pet.name;
  res.message('Information updated!');
  res.redirect('/pet/' + shreq.pet.id);
};
