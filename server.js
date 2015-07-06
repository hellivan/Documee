var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var Twitter = require("twitter");
var graph = require('fbgraph');


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
	res.setHeader('Access-Control-Allow-Headers', 'fb_access_token, twitter_access_token, Accept, Content-Type');

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

// application settings
conf.twitter.consumer_key = "r6uKNLSHibUkIxTHqkKGftZgd";
conf.twitter.consumer_secret = "V6sAHyGqmAutcCu51RLvO8mZoNR996XByBXW2j6LKK22QXiaMP";
// access tokens
conf.twitter.access_token_key = "2689340107-mHDxktHSHjFC65jENOwONuSF2vJCxgrQJiyKzLr";
conf.twitter.access_token_secret = "8egHFAyEkI4x7oFAzGHVblAFKQkjv9JKVtTECm3gGmF7c";

conf.facebook.app_secret = "c6e53075d860ac0df13ae3a5c30dd042";
conf.facebook.token = "";
conf.facebook.app_id = "1136006799750257";
conf.facebook.redirect_uri = "http://localhost:8000/fb/login";
conf.facebook.scope = 'public_profile, email, user_friends, read_custom_friendlists, user_likes, user_about_me, user_birthday, user_location, user_posts';



var client = new Twitter({
	consumer_key: conf.twitter.consumer_key,
	consumer_secret: conf.twitter.consumer_secret,
	access_token_key: conf.twitter.access_token_key,
	access_token_secret: conf.twitter.access_token_secret
});


function getPerson(twitterPerson){
	return {
		id            : twitterPerson.id,
		name          : twitterPerson.name,
		description   : twitterPerson.description,
		image         : twitterPerson.profile_image_url_https
	};
}

function getTwitterFollowing(callback){
	client.get('friends/list', {count:200}, function(error, data, response){
		if(error) throw error;
		//console.log(data);
		var persons = [];
		for (var index in data.users){
			persons.push(getPerson(data.users[index]));
		}
		callback(persons);
	});
}

function getTwitterFollowers(callback){
	client.get('followers/list', {count:200}, function(error, data, response){
		if(error) throw error;
		//console.log(data);
		var persons = [];
		for (var index in data.users){
			persons.push(getPerson(data.users[index]));
		}
		callback(persons);
	});
}

function getTwitterTrends(callback){
	client.get('trends/place', {id:23424853}, function(error, data, response){
		if(error) throw error;

		var responseData = data[0];

		console.log("Trends for: " );
		for (var index in responseData.locations){
			var location = responseData.locations[index];
			console.log(location.name);
		}
		var trends = [];


		callback(data[0].trends);
	});
}

function mergePersonsLists(persons1, persons2){
	var merged = [];
	for (var index1 in persons1){
		var person1 = persons1[index1];
		for (var index2 in persons2){
			var person2 = persons2[index2];
			console.log(person2);
			if (person1.id == person2.id){
				merged.push(person1);
			}
		}
	}
	return merged;
}


app.get("/twitter/following", function(req, res){

	getTwitterFollowing(function(persons){
		var response = {
			count   : persons.length,
			persons : persons
		}
		res.send(response);
	});
});

app.get("/twitter/followers", function(req, res){

	getTwitterFollowers(function(persons){
		var response = {
			count   : persons.length,
			persons : persons
		}
		res.send(response);
	});
});

app.get("/twitter/friends", function(req, res){

	getTwitterFollowers(function(followers){
		getTwitterFollowing(function(following){
			console.log(followers);
			console.log(following);
			var friends = mergePersonsLists(followers, following);
			var response = {
				count   : friends.length,
				persons : friends
			};
			res.send(response);
		});
	});
});

app.get("/twitter/trends", function(req, res){

	getTwitterTrends(function(trends){
		res.send(trends);
	});
});

app.get('/fb/login', function(req, res) {

	// we don't have a code yet
	// so we'll redirect to the oauth dialog
	if (!req.query.code) {
		var authUrl = graph.getOauthUrl({
			"client_id":     conf.facebook.app_id,
			"redirect_uri":  conf.facebook.redirect_uri,
			"scope":         conf.facebook.scope
		});

		if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
			res.redirect(authUrl);
		} else {  //req.query.error == 'access_denied'
			res.send('Authentication denied');
		}
		return;
	}

	console.log("Got query code: '" +  req.query.code + "'");
	graph.authorize({
		"client_id":      conf.facebook.app_id,
		"redirect_uri":   conf.facebook.redirect_uri,
		"client_secret":  conf.facebook.app_secret,
		"code":           req.query.code
	}, function (err, facebookRes) {
		if (!err) {
			conf.facebook.token = facebookRes;
			graph.setAccessToken(conf.facebook.token.access_token);
			res.redirect('/');
		} else {
			conf.facebook.token = {};
			graph.setAccessToken("");
			res.send('authorization denied');
		}
	});
});

app.get("/fb/me", function(req, res){
	var params = {};
	//params.fields = "picture";

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me", params, function(err, fb_res) {
		console.log(fb_res);
		res.send(fb_res);
	});
});

app.get("/fb/friends", function(req, res){
	var params = {};
	//params.fields = "picture";

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me/taggable_friends", params, function(err, fb_res) {
		console.log(fb_res);
		res.send(fb_res);
	});
});

app.get("/fb/feeds", function(req, res){
	var params = {};
	//params.fields = "picture";

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me/feed", params, function(err, fb_res) {
		console.log(fb_res);
		res.send(fb_res);
	});
});

app.get("/fb/permissions", function(req, res){
	var params = {};
	//params.fields = "picture";

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me/permissions", params, function(err, fb_res) {
		console.log(fb_res);
		res.send(fb_res);
	});
});

app.delete("/fb/permissions", function(req, res){

	graph.setAccessToken(req.headers.fb_access_token);
	graph.del("me/permissions", function(err, fb_res) {
		console.log(res);
		res.send("Done.");
	});
});

app.get("/", function(req, res){
	res.sendFile(__dirname + '/public/index.html');
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
