
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.stale', function(){
    it('should return false when the resource is not modified', function(done){
      var app = express();
      var etag = '"12345"';

      app.use(function(shreq, res){
        res.set('ETag', etag);
        res.send(shreq.stale);
      });

      request(app)
      .get('/')
      .set('If-None-Match', etag)
      .expect(304, done);
    })

    it('should return true when the resource is modified', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.set('ETag', '"123"');
        res.send(shreq.stale);
      });

      request(app)
      .get('/')
      .set('If-None-Match', '"12345"')
      .expect(200, 'true', done);
    })

    it('should return true without response headers', function(done){
      var app = express();

      app.use(function(shreq, res){
        res._headers = null;
        res.send(shreq.stale);
      });

      request(app)
      .get('/')
      .expect(200, 'true', done);
    })
  })
})
