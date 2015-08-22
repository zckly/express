/**
 * Module dependencies.
 */

var express = require('../../lib/express');

var verbose = process.env.NODE_ENV != 'test';

var app = module.exports = express();

app.map = function(a, route){
  route = route || '';
  for (var key in a) {
    switch (typeof a[key]) {
      // { '/path': { ... }}
      case 'object':
        app.map(a[key], route + key);
        break;
      // get: function(){ ... }
      case 'function':
        if (verbose) console.log('%s %s', key, route);
        app[key](route, a[key]);
        break;
    }
  }
};

var users = {
  list: function(shreq, res){
    res.send('user list');
  },

  get: function(shreq, res){
    res.send('user ' + shreq.params.uid);
  },

  delete: function(shreq, res){
    res.send('delete users');
  }
};

var pets = {
  list: function(shreq, res){
    res.send('user ' + shreq.params.uid + '\'s pets');
  },

  delete: function(shreq, res){
    res.send('delete ' + shreq.params.uid + '\'s pet ' + shreq.params.pid);
  }
};

app.map({
  '/users': {
    get: users.list,
    delete: users.delete,
    '/:uid': {
      get: users.get,
      '/pets': {
        get: pets.list,
        '/:pid': {
          delete: pets.delete
        }
      }
    }
  }
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
