var app, fs, jade, connect, html, server, parser, nowjs, everyone;

nowjs   = require('now');
connect = require('connect');
parser  = require('github-flavored-markdown');

fs    = require('fs');
jade  = require('jade');

app = connect();

var helpers = {};
app.settings = {};
app.settings.port = process.env.PORT || 8080;

app.use(connect.favicon());
app.use(connect.logger('dev'));
app.use(connect.static(__dirname + '/public'));
app.use(require('connect-assets')({helperContext: helpers}));

html  = jade.compile(fs.readFileSync(__dirname + '/index.jade'))(helpers);

app.use(function(req, res) {
  res.end(html);
});

server = require('http').createServer(app);

server.listen(app.settings.port, '127.0.0.1', function(err) {
  if (err) throw err;

  console.log('Server is now listening on http://127.0.0.1:%d', app.settings.port);
});

everyone = nowjs.initialize(server);

everyone.now.sendMarkdown = function(markdown) {
  this.now.getParsed(parser.parse(markdown));
};
