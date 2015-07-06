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




function getPerson(twitterPerson){
	return {
		id            : twitterPerson.id,
		name          : twitterPerson.name,
		description   : twitterPerson.description,
		image         : twitterPerson.profile_image_url_https
	};
};

function getTwitterFollowing(client, callback){
	client.get('friends/list', {count:200}, function(error, data, response){
		if(error) throw error;
		//console.log(data);
		var persons = [];
		for (var index in data.users){
			persons.push(getPerson(data.users[index]));
		}
		callback(persons);
	});
};

function getTwitterFollowers(client, callback){
	client.get('followers/list', {count:200}, function(error, data, response){
		if(error) throw error;
		//console.log(data);
		var persons = [];
		for (var index in data.users){
			persons.push(getPerson(data.users[index]));
		}
		callback(persons);
	});
};

function getTwitterTrends(client, callback){
	client.get('trends/place', {id:23424853}, function(error, data, response){
		if(error) throw error;

		var responseData = data[0];

		var res = {
			locations : [],
			trends : []
		};

		for (var index in responseData.locations){
			res.locations.push(responseData.locations[index].name);
		}
		for (var index in responseData.trends){
			res.trends.push({
				name : responseData.trends[index].name,
				url : responseData.trends[index].url
			});
		}

		callback(res);
	});
};

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
};


function twitterPersonsToFriends(persons){
	var friends = [];
	for(var index in persons){
		friends.push({
			name : persons[index].name,
			picture : persons[index].image,
			description : persons[index].description
		});
	}
	return friends;
}


app.get("/twitter/following", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	getTwitterFollowing(client, function(persons){
		res.send(twitterPersonsToFriends(persons));
	});
});

app.get("/twitter/followers", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	getTwitterFollowers(client, function(persons){
		res.send(twitterPersonsToFriends(persons));
	});
});

app.get("/twitter/friends", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	getTwitterFollowers(client, function(followers){
		getTwitterFollowing(client, function(following){
			var friends = mergePersonsLists(followers, following);
			res.send(twitterPersonsToFriends(friends));
		});
	});
});

app.get("/twitter/trends", function(req, res){
	var client = getTwitterClient(req.headers.twitter_oauth_token, req.headers.twitter_oauth_token_secret);
	getTwitterTrends(client, function(trends){
		res.send(trends);
	});
});

app.get("/fb/me", function(req, res){
	var params = {};
	params.fields = "birthday, picture, email, first_name, last_name, gender, id, link, locale, name";

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me", params, function(err, fb_res) {
		console.log(fb_res);
		var profile = {};
		profile.birthday= fb_res.birthday;
		profile.picture= fb_res.picture.data.url;
		profile.email= fb_res.email;
		profile.first_name= fb_res.first_name;
		profile.last_name= fb_res.last_name;
		profile.gender= fb_res.gender;
		profile.id= fb_res.id;
		profile.link= fb_res.link;
		profile.locale= fb_res.locale;
		profile.name = fb_res.name;
		res.send(profile);
	});
});

app.get("/fb/friends", function(req, res){
	var params = {};
	//params.fields = "picture";
	var friends = [];

	var callback = function (err, fb_res){
		console.log(fb_res);
		for (var index in fb_res.data){
			friends.push({
				name : fb_res.data[index].name,
				picture : fb_res.data[index].picture.data.url
			});
		}

		if(fb_res.paging && fb_res.paging.next){
			graph.get(fb_res.paging.next, params, callback);
		} else {
			res.send(friends);
		}
	};

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me/taggable_friends", params, callback);
});

app.get("/fb/feeds", function(req, res){
	var params = {};
	//params.fields = "picture";

	var feeds = [];
	var callback = function (err, fb_res){
		console.log(fb_res);
		for (var index in fb_res.data){
			var feed = {};
			feed.author = fb_res.data[index].from.name;
			feed.time = fb_res.data[index].updated_time;
			feed.type = fb_res.data[index].type;
			feed.message = fb_res.data[index].message;
			feed.story = fb_res.data[index].story;
			feed.picture = fb_res.data[index].picture;
			feeds.push(feed);
		}

		if(fb_res.paging && fb_res.paging.next){
			graph.get(fb_res.paging.next, params, callback);
		} else {
			res.send(feeds);
		}
	};


	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me/feed", params, callback);
});

app.get("/fb/permissions", function(req, res){
	var params = {};
	//params.fields = "picture";

	graph.setAccessToken(req.headers.fb_access_token);
	graph.get("me/permissions", params, function(err, fb_res) {
		console.log(fb_res);
		res.send(fb_res.data);
	});
});

app.delete("/fb/permissions", function(req, res){

	graph.setAccessToken(req.headers.fb_access_token);
	graph.del("me/permissions", function(err, fb_res) {
		console.log(res);
		res.send("Done.");
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
