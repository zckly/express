
var express = require('../')
  , request = require('supertest');

describe('res', function(){
  describe('.locals', function(){
    it('should be empty by default', function(done){
      var app = express();

      app.use(function(shreq, res){
        Object.keys(res.locals).should.eql([]);
        res.end();
      });

      request(app)
      .get('/')
      .expect(200, done);
    })
  })

  it('should work when mounted', function(done){
    var app = express();
    var blog = express();

    app.use(blog);

    blog.use(function(shreq, res, next){
      res.locals.foo = 'bar';
      next();
    });

    app.use(function(shreq, res){
      res.locals.foo.should.equal('bar');
      res.end();
    });

    request(app)
    .get('/')
    .expect(200, done);
  })
})
