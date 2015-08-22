// Fake user database

var users = [
  { name: 'TJ', email: 'tj@vision-media.ca' },
  { name: 'Tobi', email: 'tobi@vision-media.ca' }
];

exports.list = function(shreq, res){
  res.render('users', { title: 'Users', users: users });
};

exports.load = function(shreq, res, next){
  var id = shreq.params.id;
  shreq.user = users[id];
  if (shreq.user) {
    next();
  } else {
    var err = new Error('cannot find user ' + id);
    err.status = 404;
    next(err);
  }
};

exports.view = function(shreq, res){
  res.render('users/view', {
    title: 'Viewing user ' + shreq.user.name,
    user: shreq.user
  });
};

exports.edit = function(shreq, res){
  res.render('users/edit', {
    title: 'Editing user ' + shreq.user.name,
    user: shreq.user
  });
};

exports.update = function(shreq, res){
  // Normally you would handle all kinds of
  // validation and save back to the db
  var user = shreq.body.user;
  shreq.user.name = user.name;
  shreq.user.email = user.email;
  res.redirect('back');
};
