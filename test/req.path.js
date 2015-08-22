
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.path', function(){
    it('should return the parsed pathname', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.end(shreq.path);
      });

      request(app)
      .get('/login?redirect=/post/1/comments')
      .expect('/login', done);
    })
  })
})
