
var users = require('./db');

exports.html = function(shreq, res){
  res.send('<ul>' + users.map(function(user){
    return '<li>' + user.name + '</li>';
  }).join('') + '</ul>');
};

exports.text = function(shreq, res){
  res.send(users.map(function(user){
    return ' - ' + user.name + '\n';
  }).join(''));
};

exports.json = function(shreq, res){
  res.json(users);
};
