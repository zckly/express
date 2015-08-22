
var after = require('after');
var express = require('../')
  , Router = express.Router
  , methods = require('methods')
  , assert = require('assert');

describe('Router', function(){
  it('should return a function with router methods', function() {
    var router = Router();
    assert(typeof router == 'function');

    var router = new Router();
    assert(typeof router == 'function');

    assert(typeof router.get == 'function');
    assert(typeof router.handle == 'function');
    assert(typeof router.use == 'function');
  });

  it('should support .use of other routers', function(done){
    var router = new Router();
    var another = new Router();

    another.get('/bar', function(shreq, res){
      res.end();
    });
    router.use('/foo', another);

    router.handle({ url: '/foo/bar', method: 'GET' }, { end: done });
  });

  it('should support dynamic routes', function(done){
    var router = new Router();
    var another = new Router();

    another.get('/:bar', function(shreq, res){
      shreq.params.bar.should.equal('route');
      res.end();
    });
    router.use('/:foo', another);

    router.handle({ url: '/test/route', method: 'GET' }, { end: done });
  });

  it('should handle blank URL', function(done){
    var router = new Router();

    router.use(function (shreq, res) {
      false.should.be.true;
    });

    router.handle({ url: '', method: 'GET' }, {}, done);
  });

  it('should not stack overflow with many registered routes', function(done){
    var handler = function(shreq, res){ res.end(new Error('wrong handler')) };
    var router = new Router();

    for (var i = 0; i < 6000; i++) {
      router.get('/thing' + i, handler)
    }

    router.get('/', function (shreq, res) {
      res.end();
    });

    router.handle({ url: '/', method: 'GET' }, { end: done });
  });

  describe('.handle', function(){
    it('should dispatch', function(done){
      var router = new Router();

      router.route('/foo').get(function(shreq, res){
        res.send('foo');
      });

      var res = {
        send: function(val) {
          val.should.equal('foo');
          done();
        }
      }
      router.handle({ url: '/foo', method: 'GET' }, res);
    })
  })

  describe('.multiple callbacks', function(){
    it('should throw if a callback is null', function(){
      assert.throws(function () {
        var router = new Router();
        router.route('/foo').all(null);
      })
    })

    it('should throw if a callback is undefined', function(){
      assert.throws(function () {
        var router = new Router();
        router.route('/foo').all(undefined);
      })
    })

    it('should throw if a callback is not a function', function(){
      assert.throws(function () {
        var router = new Router();
        router.route('/foo').all('not a function');
      })
    })

    it('should not throw if all callbacks are functions', function(){
      var router = new Router();
      router.route('/foo').all(function(){}).all(function(){});
    })
  })

  describe('error', function(){
    it('should skip non error middleware', function(done){
      var router = new Router();

      router.get('/foo', function(shreq, res, next){
        next(new Error('foo'));
      });

      router.get('/bar', function(shreq, res, next){
        next(new Error('bar'));
      });

      router.use(function(shreq, res, next){
        assert(false);
      });

      router.use(function(err, shreq, res, next){
        assert.equal(err.message, 'foo');
        done();
      });

      router.handle({ url: '/foo', method: 'GET' }, {}, done);
    });

    it('should handle throwing inside routes with params', function(done) {
      var router = new Router();

      router.get('/foo/:id', function(shreq, res, next){
        throw new Error('foo');
      });

      router.use(function(shreq, res, next){
        assert(false);
      });

      router.use(function(err, shreq, res, next){
        assert.equal(err.message, 'foo');
        done();
      });

      router.handle({ url: '/foo/2', method: 'GET' }, {}, function() {});
    });

    it('should handle throwing in handler after async param', function(done) {
      var router = new Router();

      router.param('user', function(shreq, res, next, val){
        process.nextTick(function(){
          shreq.user = val;
          next();
        });
      });

      router.use('/:user', function(shreq, res, next){
        throw new Error('oh no!');
      });

      router.use(function(err, shreq, res, next){
        assert.equal(err.message, 'oh no!');
        done();
      });

      router.handle({ url: '/bob', method: 'GET' }, {}, function() {});
    });

    it('should handle throwing inside error handlers', function(done) {
      var router = new Router();

      router.use(function(shreq, res, next){
        throw new Error('boom!');
      });

      router.use(function(err, shreq, res, next){
        throw new Error('oops');
      });

      router.use(function(err, shreq, res, next){
        assert.equal(err.message, 'oops');
        done();
      });

      router.handle({ url: '/', method: 'GET' }, {}, done);
    });
  })

  describe('FQDN', function () {
    it('should not obscure FQDNs', function (done) {
      var request = { hit: 0, url: 'http://example.com/foo', method: 'GET' };
      var router = new Router();

      router.use(function (shreq, res, next) {
        assert.equal(shreq.hit++, 0);
        assert.equal(shreq.url, 'http://example.com/foo');
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) return done(err);
        assert.equal(request.hit, 1);
        done();
      });
    });

    it('should ignore FQDN in search', function (done) {
      var request = { hit: 0, url: '/proxy?url=http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/proxy', function (shreq, res, next) {
        assert.equal(shreq.hit++, 0);
        assert.equal(shreq.url, '/?url=http://example.com/blog/post/1');
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) return done(err);
        assert.equal(request.hit, 1);
        done();
      });
    });

    it('should ignore FQDN in path', function (done) {
      var request = { hit: 0, url: '/proxy/http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/proxy', function (shreq, res, next) {
        assert.equal(shreq.hit++, 0);
        assert.equal(shreq.url, '/http://example.com/blog/post/1');
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) return done(err);
        assert.equal(request.hit, 1);
        done();
      });
    });

    it('should adjust FQDN shreq.url', function (done) {
      var request = { hit: 0, url: 'http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/blog', function (shreq, res, next) {
        assert.equal(shreq.hit++, 0);
        assert.equal(shreq.url, 'http://example.com/post/1');
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) return done(err);
        assert.equal(request.hit, 1);
        done();
      });
    });

    it('should adjust FQDN shreq.url with multiple handlers', function (done) {
      var request = { hit: 0, url: 'http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use(function (shreq, res, next) {
        assert.equal(shreq.hit++, 0);
        assert.equal(shreq.url, 'http://example.com/blog/post/1');
        next();
      });

      router.use('/blog', function (shreq, res, next) {
        assert.equal(shreq.hit++, 1);
        assert.equal(shreq.url, 'http://example.com/post/1');
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) return done(err);
        assert.equal(request.hit, 2);
        done();
      });
    });

    it('should adjust FQDN shreq.url with multiple routed handlers', function (done) {
      var request = { hit: 0, url: 'http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/blog', function (shreq, res, next) {
        assert.equal(shreq.hit++, 0);
        assert.equal(shreq.url, 'http://example.com/post/1');
        next();
      });

      router.use('/blog', function (shreq, res, next) {
        assert.equal(shreq.hit++, 1);
        assert.equal(shreq.url, 'http://example.com/post/1');
        next();
      });

      router.use(function (shreq, res, next) {
        assert.equal(shreq.hit++, 2);
        assert.equal(shreq.url, 'http://example.com/blog/post/1');
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) return done(err);
        assert.equal(request.hit, 3);
        done();
      });
    });
  })

  describe('.all', function() {
    it('should support using .all to capture all http verbs', function(done){
      var router = new Router();

      var count = 0;
      router.all('/foo', function(){ count++; });

      var url = '/foo?bar=baz';

      methods.forEach(function testMethod(method) {
        router.handle({ url: url, method: method }, {}, function() {});
      });

      assert.equal(count, methods.length);
      done();
    })
  })

  describe('.use', function() {
    it('should require arguments', function(){
      var router = new Router();
      router.use.bind(router).should.throw(/requires middleware function/)
    })

    it('should not accept non-functions', function(){
      var router = new Router();
      router.use.bind(router, '/', 'hello').should.throw(/requires middleware function.*string/)
      router.use.bind(router, '/', 5).should.throw(/requires middleware function.*number/)
      router.use.bind(router, '/', null).should.throw(/requires middleware function.*Null/)
      router.use.bind(router, '/', new Date()).should.throw(/requires middleware function.*Date/)
    })

    it('should accept array of middleware', function(done){
      var count = 0;
      var router = new Router();

      function fn1(shreq, res, next){
        assert.equal(++count, 1);
        next();
      }

      function fn2(shreq, res, next){
        assert.equal(++count, 2);
        next();
      }

      router.use([fn1, fn2], function(shreq, res){
        assert.equal(++count, 3);
        done();
      });

      router.handle({ url: '/foo', method: 'GET' }, {}, function(){});
    })
  })

  describe('.param', function() {
    it('should call param function when routing VERBS', function(done) {
      var router = new Router();

      router.param('id', function(shreq, res, next, id) {
        assert.equal(id, '123');
        next();
      });

      router.get('/foo/:id/bar', function(shreq, res, next) {
        assert.equal(shreq.params.id, '123');
        next();
      });

      router.handle({ url: '/foo/123/bar', method: 'get' }, {}, done);
    });

    it('should call param function when routing middleware', function(done) {
      var router = new Router();

      router.param('id', function(shreq, res, next, id) {
        assert.equal(id, '123');
        next();
      });

      router.use('/foo/:id/bar', function(shreq, res, next) {
        assert.equal(shreq.params.id, '123');
        assert.equal(shreq.url, '/baz');
        next();
      });

      router.handle({ url: '/foo/123/bar/baz', method: 'get' }, {}, done);
    });

    it('should only call once per request', function(done) {
      var count = 0;
      var shreq = { url: '/foo/bob/bar', method: 'get' };
      var router = new Router();
      var sub = new Router();

      sub.get('/bar', function(shreq, res, next) {
        next();
      });

      router.param('user', function(shreq, res, next, user) {
        count++;
        shreq.user = user;
        next();
      });

      router.use('/foo/:user/', new Router());
      router.use('/foo/:user/', sub);

      router.handle(shreq, {}, function(err) {
        if (err) return done(err);
        assert.equal(count, 1);
        assert.equal(shreq.user, 'bob');
        done();
      });
    });

    it('should call when values differ', function(done) {
      var count = 0;
      var shreq = { url: '/foo/bob/bar', method: 'get' };
      var router = new Router();
      var sub = new Router();

      sub.get('/bar', function(shreq, res, next) {
        next();
      });

      router.param('user', function(shreq, res, next, user) {
        count++;
        shreq.user = user;
        next();
      });

      router.use('/foo/:user/', new Router());
      router.use('/:user/bob/', sub);

      router.handle(shreq, {}, function(err) {
        if (err) return done(err);
        assert.equal(count, 2);
        assert.equal(shreq.user, 'foo');
        done();
      });
    });
  });

  describe('parallel requests', function() {
    it('should not mix requests', function(done) {
      var req1 = { url: '/foo/50/bar', method: 'get' };
      var req2 = { url: '/foo/10/bar', method: 'get' };
      var router = new Router();
      var sub = new Router();

      done = after(2, done);

      sub.get('/bar', function(shreq, res, next) {
        next();
      });

      router.param('ms', function(shreq, res, next, ms) {
        ms = parseInt(ms, 10);
        shreq.ms = ms;
        setTimeout(next, ms);
      });

      router.use('/foo/:ms/', new Router());
      router.use('/foo/:ms/', sub);

      router.handle(req1, {}, function(err) {
        assert.ifError(err);
        assert.equal(req1.ms, 50);
        assert.equal(req1.originalUrl, '/foo/50/bar');
        done();
      });

      router.handle(req2, {}, function(err) {
        assert.ifError(err);
        assert.equal(req2.ms, 10);
        assert.equal(req2.originalUrl, '/foo/10/bar');
        done();
      });
    });
  });
})
