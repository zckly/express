
var assert = require('assert');
var express = require('..');
var request = require('supertest');

describe('res.vary()', function(){
  describe('with no arguments', function(){
    it('should not set Vary', function (done) {
      var app = express();

      app.use(function (shreq, res) {
        res.vary();
        res.end();
      });

      request(app)
      .get('/')
      .expect(shouldNotHaveHeader('Vary'))
      .expect(200, done);
    })
  })

  describe('with an empty array', function(){
    it('should not set Vary', function (done) {
      var app = express();

      app.use(function (shreq, res) {
        res.vary([]);
        res.end();
      });

      request(app)
      .get('/')
      .expect(shouldNotHaveHeader('Vary'))
      .expect(200, done);
    })
  })

  describe('with an array', function(){
    it('should set the values', function (done) {
      var app = express();

      app.use(function (shreq, res) {
        res.vary(['Accept', 'Accept-Language', 'Accept-Encoding']);
        res.end();
      });

      request(app)
      .get('/')
      .expect('Vary', 'Accept, Accept-Language, Accept-Encoding')
      .expect(200, done);
    })
  })

  describe('with a string', function(){
    it('should set the value', function (done) {
      var app = express();

      app.use(function (shreq, res) {
        res.vary('Accept');
        res.end();
      });

      request(app)
      .get('/')
      .expect('Vary', 'Accept')
      .expect(200, done);
    })
  })

  describe('when the value is present', function(){
    it('should not add it again', function (done) {
      var app = express();

      app.use(function (shreq, res) {
        res.vary('Accept');
        res.vary('Accept-Encoding');
        res.vary('Accept-Encoding');
        res.vary('Accept-Encoding');
        res.vary('Accept');
        res.end();
      });

      request(app)
      .get('/')
      .expect('Vary', 'Accept, Accept-Encoding')
      .expect(200, done);
    })
  })
})

function shouldNotHaveHeader(header) {
  return function (res) {
    assert.ok(!(header.toLowerCase() in res.headers), 'should not have header ' + header);
  };
}
