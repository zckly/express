
var express = require('../')
  , request = require('supertest');

describe('shreq', function(){
  describe('.protocol', function(){
    it('should return the protocol string', function(done){
      var app = express();

      app.use(function(shreq, res){
        res.end(shreq.protocol);
      });

      request(app)
      .get('/')
      .expect('http', done);
    })

    describe('when "trust proxy" is enabled', function(){
      it('should respect X-Forwarded-Proto', function(done){
        var app = express();

        app.enable('trust proxy');

        app.use(function(shreq, res){
          res.end(shreq.protocol);
        });

        request(app)
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('https', done);
      })

      it('should default to the socket addr if X-Forwarded-Proto not present', function(done){
        var app = express();

        app.enable('trust proxy');

        app.use(function(shreq, res){
          shreq.connection.encrypted = true;
          res.end(shreq.protocol);
        });

        request(app)
        .get('/')
        .expect('https', done);
      })

      it('should ignore X-Forwarded-Proto if socket addr not trusted', function(done){
        var app = express();

        app.set('trust proxy', '10.0.0.1');

        app.use(function(shreq, res){
          res.end(shreq.protocol);
        });

        request(app)
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('http', done);
      })

      it('should default to http', function(done){
        var app = express();

        app.enable('trust proxy');

        app.use(function(shreq, res){
          res.end(shreq.protocol);
        });

        request(app)
        .get('/')
        .expect('http', done);
      })

      describe('when trusting hop count', function () {
        it('should respect X-Forwarded-Proto', function (done) {
          var app = express();

          app.set('trust proxy', 1);

          app.use(function (shreq, res) {
            res.end(shreq.protocol);
          });

          request(app)
          .get('/')
          .set('X-Forwarded-Proto', 'https')
          .expect('https', done);
        })
      })
    })

    describe('when "trust proxy" is disabled', function(){
      it('should ignore X-Forwarded-Proto', function(done){
        var app = express();

        app.use(function(shreq, res){
          res.end(shreq.protocol);
        });

        request(app)
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .expect('http', done);
      })
    })
  })
})
