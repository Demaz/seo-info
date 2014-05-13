var express = require('express');
var http = require('http');
var path = require('path');
var cors = require('cors');
var connect = require('connect');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//==================================================================
//Define the strategy to be used by PassportJS
passport.use(new LocalStrategy(
function(username, password, done) {
console.log(' test check : ' + username + ' ' + password);
 if (username === "admin" && password === "admin") // stupid example
   return done(null, {name: "admin"});

 return done(null, false, { message: 'Incorrect username.' });
}
));

var app = express();
/*app.use(express.cookieParser());
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(connect.urlencoded());
app.use(connect.json());
app.use(cors());
app.set('port',process.env.PORT || 8888);*/

app.set('port', process.env.PORT || 8888);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser()); 
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(connect.urlencoded());
app.use(connect.json());
app.use(cors());
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Serialized and deserialized methods when got from session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


var users = [{"name": "baptiste","password":"demaz"},{"name": "abby","password":"lam"}];

var listeUrls = [{"uri": "jean","codeRetour":"200"},{"uri": "pantalon","codeRetour":"404"}];

app.get('/users', function(req,res) {
res.send(users);
});

app.get('/liste', function(req,res) {
	res.send(listeUrls);
	});

app.post('/users', function(req, res) {
	users.push(req.body);
    res.send(users);
});

app.post('/createProject', function(req, res) {
	console.log('creation projet');
	res.send('');
});

/*
app.post('/login', function(req, res) {
	console.log('debug : ' + req.session.islog);
	req.session.islog = false;
	for(var i=0;i < users.length;i++){ 
		console.log('name : '+users[i].name + ' pwd : '+ users[i].password);
		if(users[i].name == req.param('username')  
				&& users[i].password == req.param('password'))	{
			req.session.islog = true;
		console.log('user ' + users[i].name +' is authentified'); 
		}
	}
	res.send(req.session.islog);
});*/

app.post('/login', function(req, res) {
  res.send('true');
});


app.get('/loggedin', function(req,res) {
	res.send('true');
	});


http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});






