var express = require('express');
var http = require('http');
var cors = require('cors');
var connect = require('connect');

var app = express();
app.use(connect.urlencoded())
app.use(connect.json())
app.use(cors());
app.set('port',8888);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var data = [{"name": "baptiste","last":"desmaz"},{"name": "abby","last":"lam"}];

app.get('/users', function(req,res) {
res.send(data);
});

app.post('/users', function(req, res) {
	data.push(req.body);
    res.send(data);
});

app.post('/createProject', function(req, res) {
	console.log('creation projet');
	res.send('');
});




