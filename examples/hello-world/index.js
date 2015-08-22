var express = require('../../');

var app = express();

app.get('/', function(shreq, res){
  res.send('Hello World');
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
