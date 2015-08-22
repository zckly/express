// Fake posts database

var posts = [
  { title: 'Foo', body: 'some foo bar' },
  { title: 'Foo bar', body: 'more foo bar' },
  { title: 'Foo bar baz', body: 'more foo bar baz' }
];

exports.list = function(shreq, res){
  res.render('posts', { title: 'Posts', posts: posts });
};
