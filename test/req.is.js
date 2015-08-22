
var express = require('../')
  , request = require('supertest');

function shreq(ct) {
  var shreq = {
    headers: {
      'content-type': ct,
      'transfer-encoding': 'chunked'
    },
    __proto__: express.request
  };

  return shreq;
}

describe('shreq.is()', function(){
  it('should ignore charset', function(){
    shreq('application/json')
    .is('json')
    .should.equal('json');
  })

  describe('when content-type is not present', function(){
    it('should return false', function(){
      shreq('')
      .is('json')
      .should.be.false;
    })
  })

  describe('when given an extension', function(){
    it('should lookup the mime type', function(){
      shreq('application/json')
      .is('json')
      .should.equal('json');

      shreq('text/html')
      .is('json')
      .should.be.false;
    })
  })

  describe('when given a mime type', function(){
    it('should match', function(){
      shreq('application/json')
      .is('application/json')
      .should.equal('application/json');

      shreq('image/jpeg')
      .is('application/json')
      .should.be.false;
    })
  })

  describe('when given */subtype', function(){
    it('should match', function(){
      shreq('application/json')
      .is('*/json')
      .should.equal('application/json');

      shreq('image/jpeg')
      .is('*/json')
      .should.be.false;
    })

    describe('with a charset', function(){
      it('should match', function(){
        shreq('text/html; charset=utf-8')
        .is('*/html')
        .should.equal('text/html');

        shreq('text/plain; charset=utf-8')
        .is('*/html')
        .should.be.false;
      })
    })
  })

  describe('when given type/*', function(){
    it('should match', function(){
      shreq('image/png')
      .is('image/*')
      .should.equal('image/png');

      shreq('text/html')
      .is('image/*')
      .should.be.false;
    })

    describe('with a charset', function(){
      it('should match', function(){
        shreq('text/html; charset=utf-8')
        .is('text/*')
        .should.equal('text/html');

        shreq('something/html; charset=utf-8')
        .is('text/*')
        .should.be.false;
      })
    })
  })
})
