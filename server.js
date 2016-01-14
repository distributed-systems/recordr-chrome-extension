
// Needed to test stuff locally as angular must load templates and cannot do so from file://

var express = require( 'express' );

var app = express();
app.use(express.static('.'));

var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});