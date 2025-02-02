
var express = require('../')
  , request = require('supertest');

describe('res', function(){
  describe('.clearCookie(name)', function(){
    it('should set a cookie passed expiry', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.clearCookie('sid').end();
      });

      request(app)
      .get('/')
      .end(function(err, res){
        var val = 'sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        res.header['set-cookie'].should.eql([val]);
        done();
      })
    })
  })

  describe('.clearCookie(name, options)', function(){
    it('should set the given params', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.clearCookie('sid', { path: '/admin' }).end();
      });

      request(app)
      .get('/')
      .end(function(err, res){
        var val = 'sid=; Path=/admin; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        res.header['set-cookie'].should.eql([val]);
        done();
      })
    })
  })
})
