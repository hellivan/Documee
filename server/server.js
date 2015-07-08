var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Twitter = require("twitter");
var graph = require('fbgraph');
var twitter_data = require('./data_providers/twitter');
var fb_data = require('./data_providers/facebook')
var mongoose = require('mongoose');


var app = express();


// ---------- configuration ----------
app.use(express.static(__dirname + '/../public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'fb_access_token, twitter_oauth_token, twitter_oauth_token_secret, documee_key, Accept, Content-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// ---------- functions ----------

var conf = {};

conf.twitter = {};
conf.facebook = {};


conf.twitter.consumer_key = "r6uKNLSHibUkIxTHqkKGftZgd";
conf.twitter.consumer_secret = "V6sAHyGqmAutcCu51RLvO8mZoNR996XByBXW2j6LKK22QXiaMP";


conf.facebook.app_id = "1136006799750257";
conf.facebook.app_secret = "c6e53075d860ac0df13ae3a5c30dd042";
conf.facebook.token = "";
conf.facebook.redirect_uri = "http://localhost:8000/fb/login";
conf.facebook.scope = 'public_profile, email, user_friends, read_custom_friendlists, user_likes, user_about_me, user_birthday, user_location, user_posts';



function getTwitterClient(oauth_token, oauth_token_secret){
	console.log("Creating twitter client with oauth: " + oauth_token + " - " + oauth_token_secret);
	return new Twitter({
		consumer_key: conf.twitter.consumer_key,
		consumer_secret: conf.twitter.consumer_secret,
		access_token_key: oauth_token,
		access_token_secret: oauth_token_secret
	});
};


app.get("/twitter/following", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	twitter_data.getFollowing(client, function(following){
		res.send(following);
	});
});

app.get("/twitter/followers", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	twitter_data.getFollowers(client, function(followers){
		res.send(followers);
	});
});

app.get("/twitter/friends", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	twitter_data.getFriends(client, function(friends){
		res.send(friends);
	});
});

app.get("/twitter/trends", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	twitter_data.getTrends(client, function(trends){
		res.send(trends);
	});
});

app.get("/twitter/me", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	twitter_data.getMe(client, function(user){
		res.send(user);
	});
});

app.post("/twitter/status", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	console.log("Trying to post '" + req.body.status + "' on twitter...")
	twitter_data.postStatus(client, req.body.status, function(tweet){
		res.send(tweet);
	});
});

app.get("/fb/me", function(req, res){
	var access_token = req.headers.fb_access_token;
	fb_data.getMe(graph, access_token, function(profile){
		res.send(profile);
	});
});

app.get("/fb/friends", function(req, res){
	var access_token = req.headers.fb_access_token;
	fb_data.getFriends(graph, access_token, function(friends){
		res.send(friends);
	});
});

app.get("/fb/feeds", function(req, res){
	var access_token = req.headers.fb_access_token;
	fb_data.getFeeds(graph, access_token, function(feeds){
		res.send(feeds);
	});
});

app.get("/fb/permissions", function(req, res){
	var access_token = req.headers.fb_access_token;
	fb_data.getPermissions(graph, access_token, function(permissions){
		res.send(permissions);
	});
});

app.delete("/fb/permissions", function(req, res){
	var access_token = req.headers.fb_access_token;
	fb_data.deletePermissions(graph, access_token, function(permissions){
		res.send(permissions);
	});
});

app.post("/fb/status", function(req, res){
	console.log("Trying to post '" + req.body.status + "' on facebook...");

	var access_token = req.headers.fb_access_token;
	fb_data.postStatus(graph, access_token, req.body.status, function(permissions){
		res.send(permissions);
	});
});

app.get("/api/fb", function(req,res){
	res.send({
		app_id : conf.facebook.app_id,
		permissions : conf.facebook.scope
	});
});

app.get("/api/twitter", function(req,res){
	res.send({
		app_id : conf.twitter.access_token_key
	});
});



var server = app.listen(8000, function(){
	var host = server.address().adress;
	var port = server.address().port;

	console.log("App is listening at http://%s:%s", host, port);
});
