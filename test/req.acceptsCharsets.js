
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.acceptsCharsets(type)', function(){
    describe('when Accept-Charset is not present', function(){
      it('should return true', function(done){
        var app = express();

        app.use(function(shreq, res, next){
          res.end(shreq.acceptsCharsets('utf-8') ? 'yes' : 'no');
        });

        request(app)
        .get('/')
        .expect('yes', done);
      })
    })

    describe('when Accept-Charset is not present', function(){
      it('should return true when present', function(done){
        var app = express();

        app.use(function(shreq, res, next){
          res.end(shreq.acceptsCharsets('utf-8') ? 'yes' : 'no');
        });

        request(app)
        .get('/')
        .set('Accept-Charset', 'foo, bar, utf-8')
        .expect('yes', done);
      })

      it('should return false otherwise', function(done){
        var app = express();

        app.use(function(shreq, res, next){
          res.end(shreq.acceptsCharsets('utf-8') ? 'yes' : 'no');
        });

        request(app)
        .get('/')
        .set('Accept-Charset', 'foo, bar')
        .expect('no', done);
      })
    })
  })
})
