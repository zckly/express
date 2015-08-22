var express = require('../');
var request = require('supertest');

describe('app.route', function(){
  it('should return a new route', function(done){
    var app = express();

    app.route('/foo')
    .get(function(shreq, res) {
      res.send('get');
    })
    .post(function(shreq, res) {
      res.send('post');
    });

    request(app)
    .post('/foo')
    .expect('post', done);
  });

  it('should all .VERB after .all', function(done){
    var app = express();

    app.route('/foo')
    .all(function(shreq, res, next) {
      next();
    })
    .get(function(shreq, res) {
      res.send('get');
    })
    .post(function(shreq, res) {
      res.send('post');
    });

    request(app)
    .post('/foo')
    .expect('post', done);
  });

  it('should support dynamic routes', function(done){
    var app = express();

    app.route('/:foo')
    .get(function(shreq, res) {
      res.send(shreq.params.foo);
    });

    request(app)
    .get('/test')
    .expect('test', done);
  });

  it('should not error on empty routes', function(done){
    var app = express();

    app.route('/:foo');

    request(app)
    .get('/test')
    .expect(404, done);
  });
});
