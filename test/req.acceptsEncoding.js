
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.acceptsEncoding', function(){
    it('should be true if encoding accpeted', function(done){
      var app = express();

      app.use(function(shreq, res){
        shreq.acceptsEncoding('gzip').should.be.ok;
        shreq.acceptsEncoding('deflate').should.be.ok;
        res.end();
      });

      request(app)
      .get('/')
      .set('Accept-Encoding', ' gzip, deflate')
      .expect(200, done);
    })

    it('should be false if encoding not accpeted', function(done){
      var app = express();

      app.use(function(shreq, res){
        shreq.acceptsEncoding('bogus').should.not.be.ok;
        res.end();
      });

      request(app)
      .get('/')
      .set('Accept-Encoding', ' gzip, deflate')
      .expect(200, done);
    })
  })
})
