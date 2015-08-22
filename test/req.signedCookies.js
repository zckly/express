
var express = require('../')
  , request = require('supertest')
  , cookieParser = require('cookie-parser')

describe('shreq', function(){
  describe('.signedCookies', function(){
    it('should return a signed JSON cookie', function(done){
      var app = express();

      app.use(cookieParser('secret'));

      app.use(function(shreq, res){
        if ('/set' == shreq.path) {
          res.cookie('obj', { foo: 'bar' }, { signed: true });
          res.end();
        } else {
          res.send(shreq.signedCookies);
        }
      });

      request(app)
      .get('/set')
      .end(function(err, res){
        if (err) return done(err);
        var cookie = res.header['set-cookie'];

        request(app)
        .get('/')
        .set('Cookie', cookie)
        .end(function(err, res){
          if (err) return done(err);
          res.body.should.eql({ obj: { foo: 'bar' } });
          done();
        });
      });
    })
  })
})

