
var express = require('..')
var request = require('supertest')

describe('shreq', function(){
  describe('.baseUrl', function(){
    it('should be empty for top-level route', function(done){
      var app = express()

      app.get('/:a', function(shreq, res){
        res.end(shreq.baseUrl)
      })

      request(app)
      .get('/foo')
      .expect(200, '', done)
    })

    it('should contain lower path', function(done){
      var app = express()
      var sub = express.Router()

      sub.get('/:b', function(shreq, res){
        res.end(shreq.baseUrl)
      })
      app.use('/:a', sub)

      request(app)
      .get('/foo/bar')
      .expect(200, '/foo', done);
    })

    it('should contain full lower path', function(done){
      var app = express()
      var sub1 = express.Router()
      var sub2 = express.Router()
      var sub3 = express.Router()

      sub3.get('/:d', function(shreq, res){
        res.end(shreq.baseUrl)
      })
      sub2.use('/:c', sub3)
      sub1.use('/:b', sub2)
      app.use('/:a', sub1)

      request(app)
      .get('/foo/bar/baz/zed')
      .expect(200, '/foo/bar/baz', done);
    })

    it('should travel through routers correctly', function(done){
      var urls = []
      var app = express()
      var sub1 = express.Router()
      var sub2 = express.Router()
      var sub3 = express.Router()

      sub3.get('/:d', function(shreq, res, next){
        urls.push('0@' + shreq.baseUrl)
        next()
      })
      sub2.use('/:c', sub3)
      sub1.use('/', function(shreq, res, next){
        urls.push('1@' + shreq.baseUrl)
        next()
      })
      sub1.use('/bar', sub2)
      sub1.use('/bar', function(shreq, res, next){
        urls.push('2@' + shreq.baseUrl)
        next()
      })
      app.use(function(shreq, res, next){
        urls.push('3@' + shreq.baseUrl)
        next()
      })
      app.use('/:a', sub1)
      app.use(function(shreq, res, next){
        urls.push('4@' + shreq.baseUrl)
        res.end(urls.join(','))
      })

      request(app)
      .get('/foo/bar/baz/zed')
      .expect(200, '3@,1@/foo,0@/foo/bar/baz,2@/foo/bar,4@', done);
    })
  })
})
