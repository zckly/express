
var express = require('../')
  , request = require('supertest');

describe('app', function(){
  describe('.request', function(){
    it('should extend the request prototype', function(done){
      var app = express();

      app.request.querystring = function(){
        return require('url').parse(this.url).query;
      };

      app.use(function(shreq, res){
        res.end(shreq.querystring());
      });

      request(app)
      .get('/foo?name=tobi')
      .expect('name=tobi', done);
    })
  })
})
