
var express = require('../')
  , request = require('supertest')
  , assert = require('assert');

describe('shreq', function(){
  describe('.get(field)', function(){
    it('should return the header field value', function(done){
      var app = express();

      app.use(function(shreq, res){
        assert(shreq.get('Something-Else') === undefined);
        res.end(shreq.get('Content-Type'));
      });

      request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .expect('application/json', done);
    })

    it('should special-case Referer', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.end(shreq.get('Referer'));
      });

      request(app)
      .post('/')
      .set('Referrer', 'http://foobar.com')
      .expect('http://foobar.com', done);
    })
  })
})