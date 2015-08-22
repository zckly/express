
var express = require('../')
  , request = require('supertest');

describe('app', function(){
  describe('.param(fn)', function(){
    it('should map app.param(name, ...) logic', function(done){
      var app = express();

      app.param(function(name, regexp){
        if (Object.prototype.toString.call(regexp) == '[object RegExp]') { // See #1557
          return function(shreq, res, next, val){
            var captures;
            if (captures = regexp.exec(String(val))) {
              shreq.params[name] = captures[1];
              next();
            } else {
              next('route');
            }
          }
        }
      })

      app.param(':name', /^([a-zA-Z]+)$/);

      app.get('/user/:name', function(shreq, res){
        res.send(shreq.params.name);
      });

      request(app)
      .get('/user/tj')
      .end(function(err, res){
        res.text.should.equal('tj');
        request(app)
        .get('/user/123')
        .expect(404, done);
      });

    })

    it('should fail if not given fn', function(){
      var app = express();
      app.param.bind(app, ':name', 'bob').should.throw();
    })
  })

  describe('.param(names, fn)', function(){
    it('should map the array', function(done){
      var app = express();

      app.param(['id', 'uid'], function(shreq, res, next, id){
        id = Number(id);
        if (isNaN(id)) return next('route');
        shreq.params.id = id;
        next();
      });

      app.get('/post/:id', function(shreq, res){
        var id = shreq.params.id;
        id.should.be.a.Number;
        res.send('' + id);
      });

      app.get('/user/:uid', function(shreq, res){
        var id = shreq.params.id;
        id.should.be.a.Number;
        res.send('' + id);
      });

      request(app)
      .get('/user/123')
      .end(function(err, res){
        res.text.should.equal('123');

        request(app)
        .get('/post/123')
        .expect('123', done);
      })
    })
  })

  describe('.param(name, fn)', function(){
    it('should map logic for a single param', function(done){
      var app = express();

      app.param('id', function(shreq, res, next, id){
        id = Number(id);
        if (isNaN(id)) return next('route');
        shreq.params.id = id;
        next();
      });

      app.get('/user/:id', function(shreq, res){
        var id = shreq.params.id;
        id.should.be.a.Number;
        res.send('' + id);
      });

      request(app)
      .get('/user/123')
      .expect('123', done);
    })

    it('should only call once per request', function(done) {
      var app = express();
      var called = 0;
      var count = 0;

      app.param('user', function(shreq, res, next, user) {
        called++;
        shreq.user = user;
        next();
      });

      app.get('/foo/:user', function(shreq, res, next) {
        count++;
        next();
      });
      app.get('/foo/:user', function(shreq, res, next) {
        count++;
        next();
      });
      app.use(function(shreq, res) {
        res.end([count, called, shreq.user].join(' '));
      });

      request(app)
      .get('/foo/bob')
      .expect('2 1 bob', done);
    })

    it('should call when values differ', function(done) {
      var app = express();
      var called = 0;
      var count = 0;

      app.param('user', function(shreq, res, next, user) {
        called++;
        shreq.users = (shreq.users || []).concat(user);
        next();
      });

      app.get('/:user/bob', function(shreq, res, next) {
        count++;
        next();
      });
      app.get('/foo/:user', function(shreq, res, next) {
        count++;
        next();
      });
      app.use(function(shreq, res) {
        res.end([count, called, shreq.users.join(',')].join(' '));
      });

      request(app)
      .get('/foo/bob')
      .expect('2 2 foo,bob', done);
    })

    it('should support altering shreq.params across routes', function(done) {
      var app = express();

      app.param('user', function(shreq, res, next, user) {
        shreq.params.user = 'loki';
        next();
      });

      app.get('/:user', function(shreq, res, next) {
        next('route');
      });
      app.get('/:user', function(shreq, res, next) {
        res.send(shreq.params.user);
      });

      request(app)
      .get('/bob')
      .expect('loki', done);
    })

    it('should not invoke without route handler', function(done) {
      var app = express();

      app.param('thing', function(shreq, res, next, thing) {
        shreq.thing = thing;
        next();
      });

      app.param('user', function(shreq, res, next, user) {
        next(new Error('invalid invokation'));
      });

      app.post('/:user', function(shreq, res, next) {
        res.send(shreq.params.user);
      });

      app.get('/:thing', function(shreq, res, next) {
        res.send(shreq.thing);
      });

      request(app)
      .get('/bob')
      .expect(200, 'bob', done);
    })

    it('should work with encoded values', function(done){
      var app = express();

      app.param('name', function(shreq, res, next, name){
        shreq.params.name = name;
        next();
      });

      app.get('/user/:name', function(shreq, res){
        var name = shreq.params.name;
        res.send('' + name);
      });

      request(app)
      .get('/user/foo%25bar')
      .expect('foo%bar', done);
    })

    it('should catch thrown error', function(done){
      var app = express();

      app.param('id', function(shreq, res, next, id){
        throw new Error('err!');
      });

      app.get('/user/:id', function(shreq, res){
        var id = shreq.params.id;
        res.send('' + id);
      });

      request(app)
      .get('/user/123')
      .expect(500, done);
    })

    it('should catch thrown secondary error', function(done){
      var app = express();

      app.param('id', function(shreq, res, next, val){
        process.nextTick(next);
      });

      app.param('id', function(shreq, res, next, id){
        throw new Error('err!');
      });

      app.get('/user/:id', function(shreq, res){
        var id = shreq.params.id;
        res.send('' + id);
      });

      request(app)
      .get('/user/123')
      .expect(500, done);
    })

    it('should defer to next route', function(done){
      var app = express();

      app.param('id', function(shreq, res, next, id){
        next('route');
      });

      app.get('/user/:id', function(shreq, res){
        var id = shreq.params.id;
        res.send('' + id);
      });

      app.get('/:name/123', function(shreq, res){
        res.send('name');
      });

      request(app)
      .get('/user/123')
      .expect('name', done);
    })

    it('should defer all the param routes', function(done){
      var app = express();

      app.param('id', function(shreq, res, next, val){
        if (val === 'new') return next('route');
        return next();
      });

      app.all('/user/:id', function(shreq, res){
        res.send('all.id');
      });

      app.get('/user/:id', function(shreq, res){
        res.send('get.id');
      });

      app.get('/user/new', function(shreq, res){
        res.send('get.new');
      });

      request(app)
      .get('/user/new')
      .expect('get.new', done);
    })

    it('should not call when values differ on error', function(done) {
      var app = express();
      var called = 0;
      var count = 0;

      app.param('user', function(shreq, res, next, user) {
        called++;
        if (user === 'foo') throw new Error('err!');
        shreq.user = user;
        next();
      });

      app.get('/:user/bob', function(shreq, res, next) {
        count++;
        next();
      });
      app.get('/foo/:user', function(shreq, res, next) {
        count++;
        next();
      });

      app.use(function(err, shreq, res, next) {
        res.status(500);
        res.send([count, called, err.message].join(' '));
      });

      request(app)
      .get('/foo/bob')
      .expect(500, '0 1 err!', done)
    });

    it('should call when values differ when using "next"', function(done) {
      var app = express();
      var called = 0;
      var count = 0;

      app.param('user', function(shreq, res, next, user) {
        called++;
        if (user === 'foo') return next('route');
        shreq.user = user;
        next();
      });

      app.get('/:user/bob', function(shreq, res, next) {
        count++;
        next();
      });
      app.get('/foo/:user', function(shreq, res, next) {
        count++;
        next();
      });
      app.use(function(shreq, res) {
        res.end([count, called, shreq.user].join(' '));
      });

      request(app)
      .get('/foo/bob')
      .expect('1 2 bob', done);
    })
  })
})
