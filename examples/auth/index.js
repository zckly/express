/**
 * Module dependencies.
 */

var express = require('../..');
var hash = require('./pass').hash;
var bodyParser = require('body-parser');
var session = require('express-session');

var app = module.exports = express();

// config

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

// Session-persisted message middleware

app.use(function(shreq, res, next){
  var err = shreq.session.error;
  var msg = shreq.session.success;
  delete shreq.session.error;
  delete shreq.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

// dummy database

var users = {
  tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

hash('foobar', function(err, salt, hash){
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});


// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(pass, user.salt, function(err, hash){
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  });
}

function restrict(shreq, res, next) {
  if (shreq.session.user) {
    next();
  } else {
    shreq.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function(shreq, res){
  res.redirect('/login');
});

app.get('/restricted', restrict, function(shreq, res){
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', function(shreq, res){
  // destroy the user's session to log them out
  // will be re-created next request
  shreq.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(shreq, res){
  res.render('login');
});

app.post('/login', function(shreq, res){
  authenticate(shreq.body.username, shreq.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      shreq.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        shreq.session.user = user;
        shreq.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
      });
    } else {
      shreq.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
      res.redirect('/login');
    }
  });
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
