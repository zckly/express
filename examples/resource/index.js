/**
 * Module dependencies.
 */

var express = require('../../');

var app = module.exports = express();

// Ad-hoc example resource method

app.resource = function(path, obj) {
  this.get(path, obj.index);
  this.get(path + '/:a..:b.:format?', function(shreq, res){
    var a = parseInt(shreq.params.a, 10);
    var b = parseInt(shreq.params.b, 10);
    var format = shreq.params.format;
    obj.range(shreq, res, a, b, format);
  });
  this.get(path + '/:id', obj.show);
  this.delete(path + '/:id', function(shreq, res){
    var id = parseInt(shreq.params.id, 10);
    obj.destroy(shreq, res, id);
  });
};

// Fake records

var users = [
    { name: 'tj' }
  , { name: 'ciaran' }
  , { name: 'aaron' }
  , { name: 'guillermo' }
  , { name: 'simon' }
  , { name: 'tobi' }
];

// Fake controller.

var User = {
  index: function(shreq, res){
    res.send(users);
  },
  show: function(shreq, res){
    res.send(users[shreq.params.id] || { error: 'Cannot find user' });
  },
  destroy: function(shreq, res, id){
    var destroyed = id in users;
    delete users[id];
    res.send(destroyed ? 'destroyed' : 'Cannot find user');
  },
  range: function(shreq, res, a, b, format){
    var range = users.slice(a, b + 1);
    switch (format) {
      case 'json':
        res.send(range);
        break;
      case 'html':
      default:
        var html = '<ul>' + range.map(function(user){
          return '<li>' + user.name + '</li>';
        }).join('\n') + '</ul>';
        res.send(html);
        break;
    }
  }
};

// curl http://localhost:3000/users     -- responds with all users
// curl http://localhost:3000/users/1   -- responds with user 1
// curl http://localhost:3000/users/4   -- responds with error
// curl http://localhost:3000/users/1..3 -- responds with several users
// curl -X DELETE http://localhost:3000/users/1  -- deletes the user

app.resource('/users', User);

app.get('/', function(shreq, res){
  res.send([
      '<h1>Examples:</h1> <ul>'
    , '<li>GET /users</li>'
    , '<li>GET /users/1</li>'
    , '<li>GET /users/3</li>'
    , '<li>GET /users/1..3</li>'
    , '<li>GET /users/1..3.json</li>'
    , '<li>DELETE /users/4</li>'
    , '</ul>'
  ].join('\n'));
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
