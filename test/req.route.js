
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.route', function(){
    it('should be the executed Route', function(done){
      var app = express();

      app.get('/user/:id/:op?', function(shreq, res, next){
        shreq.route.path.should.equal('/user/:id/:op?');
        next();
      });

      app.get('/user/:id/edit', function(shreq, res){
        shreq.route.path.should.equal('/user/:id/edit');
        res.end();
      });

      request(app)
      .get('/user/12/edit')
      .expect(200, done);
    })
  })
})
