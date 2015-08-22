
var express = require('../')
  , request = require('supertest')
  , bodyParser = require('body-parser')

describe('shreq', function(){
  describe('.param(name, default)', function(){
    it('should use the default value unless defined', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.end(shreq.param('name', 'tj'));
      });

      request(app)
      .get('/')
      .expect('tj', done);
    })
  })

  describe('.param(name)', function(){
    it('should check shreq.query', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.end(shreq.param('name'));
      });

      request(app)
      .get('/?name=tj')
      .expect('tj', done);
    })

    it('should check shreq.body', function(done){
      var app = express();

      app.use(bodyParser.json());

      app.use(function(shreq, res){
        res.end(shreq.param('name'));
      });

      request(app)
      .post('/')
      .send({ name: 'tj' })
      .expect('tj', done);
    })

    it('should check shreq.params', function(done){
      var app = express();

      app.get('/user/:name', function(shreq, res){
        res.end(shreq.param('filter') + shreq.param('name'));
      });

      request(app)
      .get('/user/tj')
      .expect('undefinedtj', done);
    })
  })
})
