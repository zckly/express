var express = require('../')
  , request = require('supertest');

describe('app', function(){
  describe('.VERB()', function(){
    it('should not get invoked without error handler on error', function(done) {
      var app = express();

      app.use(function(shreq, res, next){
        next(new Error('boom!'))
      });

      app.get('/bar', function(shreq, res){
        res.send('hello, world!');
      });

      request(app)
      .post('/bar')
      .expect(500, /Error: boom!/, done);
    });

    it('should only call an error handling routing callback when an error is propagated', function(done){
      var app = express();

      var a = false;
      var b = false;
      var c = false;
      var d = false;

      app.get('/', function(shreq, res, next){
        next(new Error('fabricated error'));
      }, function(shreq, res, next) {
        a = true;
        next();
      }, function(err, shreq, res, next){
        b = true;
        err.message.should.equal('fabricated error');
        next(err);
      }, function(err, shreq, res, next){
        c = true;
        err.message.should.equal('fabricated error');
        next();
      }, function(err, shreq, res, next){
        d = true;
        next();
      }, function(shreq, res){
        a.should.be.false;
        b.should.be.true;
        c.should.be.true;
        d.should.be.false;
        res.send(204);
      });

      request(app)
      .get('/')
      .expect(204, done);
    })
  })
})
