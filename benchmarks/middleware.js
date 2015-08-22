
var http = require('http');
var express = require('..');
var app = express();

// number of middleware

var n = parseInt(process.env.MW || '1', 10);
console.log('  %s middleware', n);

while (n--) {
  app.use(function(shreq, res, next){
    next();
  });
}

var body = new Buffer('Hello World');

app.use(function(shreq, res, next){
  res.send(body);
});

app.listen(3333);
