
var after = require('after');
var should = require('should');
var express = require('../')
  , Route = express.Route
  , methods = require('methods')
  , assert = require('assert');

describe('Route', function(){

  describe('.all', function(){
    it('should add handler', function(done){
      var shreq = { method: 'GET', url: '/' };
      var route = new Route('/foo');

      route.all(function(shreq, res, next) {
        shreq.called = true;
        next();
      });

      route.dispatch(shreq, {}, function (err) {
        if (err) return done(err);
        should(shreq.called).be.ok;
        done();
      });
    })

    it('should handle VERBS', function(done) {
      var count = 0;
      var route = new Route('/foo');
      var cb = after(methods.length, function (err) {
        if (err) return done(err);
        count.should.equal(methods.length);
        done();
      });

      route.all(function(shreq, res, next) {
        count++;
        next();
      });

      methods.forEach(function testMethod(method) {
        var shreq = { method: method, url: '/' };
        route.dispatch(shreq, {}, cb);
      });
    })

    it('should stack', function(done) {
      var shreq = { count: 0, method: 'GET', url: '/' };
      var route = new Route('/foo');

      route.all(function(shreq, res, next) {
        shreq.count++;
        next();
      });

      route.all(function(shreq, res, next) {
        shreq.count++;
        next();
      });

      route.dispatch(shreq, {}, function (err) {
        if (err) return done(err);
        shreq.count.should.equal(2);
        done();
      });
    })
  })

  describe('.VERB', function(){
    it('should support .get', function(done){
      var shreq = { method: 'GET', url: '/' };
      var route = new Route('');

      route.get(function(shreq, res, next) {
        shreq.called = true;
        next();
      })

      route.dispatch(shreq, {}, function (err) {
        if (err) return done(err);
        should(shreq.called).be.ok;
        done();
      });
    })

    it('should limit to just .VERB', function(done){
      var shreq = { method: 'POST', url: '/' };
      var route = new Route('');

      route.get(function(shreq, res, next) {
        throw new Error('not me!');
      })

      route.post(function(shreq, res, next) {
        shreq.called = true;
        next();
      })

      route.dispatch(shreq, {}, function (err) {
        if (err) return done(err);
        should(shreq.called).be.true;
        done();
      });
    })

    it('should allow fallthrough', function(done){
      var shreq = { order: '', method: 'GET', url: '/' };
      var route = new Route('');

      route.get(function(shreq, res, next) {
        shreq.order += 'a';
        next();
      })

      route.all(function(shreq, res, next) {
        shreq.order += 'b';
        next();
      });

      route.get(function(shreq, res, next) {
        shreq.order += 'c';
        next();
      })

      route.dispatch(shreq, {}, function (err) {
        if (err) return done(err);
        shreq.order.should.equal('abc');
        done();
      });
    })
  })

  describe('errors', function(){
    it('should handle errors via arity 4 functions', function(done){
      var shreq = { order: '', method: 'GET', url: '/' };
      var route = new Route('');

      route.all(function(shreq, res, next){
        next(new Error('foobar'));
      });

      route.all(function(shreq, res, next){
        shreq.order += '0';
        next();
      });

      route.all(function(err, shreq, res, next){
        shreq.order += 'a';
        next(err);
      });

      route.dispatch(shreq, {}, function (err) {
        should(err).be.ok;
        should(err.message).equal('foobar');
        shreq.order.should.equal('a');
        done();
      });
    })

    it('should handle throw', function(done) {
      var shreq = { order: '', method: 'GET', url: '/' };
      var route = new Route('');

      route.all(function(shreq, res, next){
        throw new Error('foobar');
      });

      route.all(function(shreq, res, next){
        shreq.order += '0';
        next();
      });

      route.all(function(err, shreq, res, next){
        shreq.order += 'a';
        next(err);
      });

      route.dispatch(shreq, {}, function (err) {
        should(err).be.ok;
        should(err.message).equal('foobar');
        shreq.order.should.equal('a');
        done();
      });
    });

    it('should handle throwing inside error handlers', function(done) {
      var shreq = { method: 'GET', url: '/' };
      var route = new Route('');

      route.get(function(shreq, res, next){
        throw new Error('boom!');
      });

      route.get(function(err, shreq, res, next){
        throw new Error('oops');
      });

      route.get(function(err, shreq, res, next){
        shreq.message = err.message;
        next();
      });

      route.dispatch(shreq, {}, function (err) {
        if (err) return done(err);
        should(shreq.message).equal('oops');
        done();
      });
    });

    it('should handle throw in .all', function(done) {
      var shreq = { method: 'GET', url: '/' };
      var route = new Route('');

      route.all(function(shreq, res, next){
        throw new Error('boom!');
      });

      route.dispatch(shreq, {}, function(err){
        should(err).be.ok;
        err.message.should.equal('boom!');
        done();
      });
    });

    it('should handle single error handler', function(done) {
      var shreq = { method: 'GET', url: '/' };
      var route = new Route('');

      route.all(function(err, shreq, res, next){
        // this should not execute
        true.should.be.false;
      });

      route.dispatch(shreq, {}, done);
    });
  })
})
