
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.acceptsLanguages', function(){
    it('should be true if language accpeted', function(done){
      var app = express();

      app.use(function(shreq, res){
        shreq.acceptsLanguages('en-us').should.be.ok;
        shreq.acceptsLanguages('en').should.be.ok;
        res.end();
      });

      request(app)
      .get('/')
      .set('Accept-Language', 'en;q=.5, en-us')
      .expect(200, done);
    })

    it('should be false if language not accpeted', function(done){
      var app = express();

      app.use(function(shreq, res){
        shreq.acceptsLanguages('es').should.not.be.ok;
        res.end();
      });

      request(app)
      .get('/')
      .set('Accept-Language', 'en;q=.5, en-us')
      .expect(200, done);
    })

    describe('when Accept-Language is not present', function(){
      it('should always return true', function(done){
        var app = express();

        app.use(function(shreq, res){
          shreq.acceptsLanguages('en').should.be.ok;
          shreq.acceptsLanguages('es').should.be.ok;
          shreq.acceptsLanguages('jp').should.be.ok;
          res.end();
        });

        request(app)
        .get('/')
        .expect(200, done);
      })
    })
  })
})
