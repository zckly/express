var express = require('../../..');

var apiv1 = express.Router();

apiv1.get('/', function(shreq, res) {
  res.send('Hello from APIv1 root route.');
});

apiv1.get('/users', function(shreq, res) {
  res.send('List of APIv1 users.');
});

module.exports = apiv1;
