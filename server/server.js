var express = require("express");
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var twitter = require('./data_providers/twitter');
var fb = require('./data_providers/facebook');

var consumerModel = require('./models/consumer');
var providerModel = require('./models/config/providers');

var uuid = require('node-uuid');

var passport = require('passport');
var LocalStrategy = require('passport-localapikey-update').Strategy;

var mongoose = require('mongoose');

// ==================  configure mongoose and its models  ==================
mongoose.connect('mongodb://localhost/documee_proto');
var Consumer = consumerModel(mongoose);
var Provider = providerModel(mongoose);


// ==================  configure passport   ==================
passport.serializeUser(function(user, done) {
	console.log("Serializing user...");
  	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  	console.log("Deserializing user...");
	Consumer.findById(id, function (err, user) {
    	done(err, user);
  	});
});

passport.use(new LocalStrategy({apiKeyHeader: "api_key"}, function(api_key, done) {
		console.log("Checking validity of key " + api_key);
		checkAPIKey(api_key, function(err, consumer){
			if (err) { return done(null, false, {message: err.message}); }
			return done(null, consumer);
		});
}));




// ==================  configure express  ==================
var app = express();
app.use(express.static(__dirname + '/../example'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'fb_access_token, twitter_oauth_token, twitter_oauth_token_secret, api_key, Accept, Content-Type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});
app.use(passport.initialize());



// ==================  functions for retrieving provider information  ==================

function getProviderConfig(provider_name, callback){
	Provider.findOne({provider_name: provider_name}, function(err, provider){
		if(err){throw err};
		callback(provider);
	});
};

function getFacebookConfig(callback){
	getProviderConfig('facebook', callback);
}

function getTwitterConfig(callback){
	getProviderConfig('twitter', callback);
}


// ==================  generic functions used by the app  ==================
function createAPIConsumer(query){
	return new Consumer({
		company_name: query.company_name,
		email: query.email,
		api_key: uuid.v4(),
		created_at: new Date(),
		project: {
			name: query.project_name,
			description: query.project_description,
			url: query.project_url
		},
		authorized: false
	});
};

function checkAPIKey(api_key, callback){
	if(!api_key) {
		callback({
			status: 401,
			error : "INVALID_KEY",
			message : "Not a valid API-key!"
		});
	}
	Consumer.findOne({api_key : api_key}, function(dberr, consumer){
		if(dberr) {
			console.log(dberr);
			return callback(dberr);
		}

		if(consumer) {
			if(consumer.authorized) { return callback(null, consumer); }
			return callback({
				status: 401,
				error : "KEY_NOT_ACTIVATED",
				message : "Your API-key not activated yet!"
			});
		}
		return callback({
			status: 401,
			error : "KEY_NOT_REGISTERED",
			message : "Your API-key not registered!"
		});
	});
};

var auth_local_api_key = passport.authenticate('localapikey', {
	session : false,
	apiKeyHeader: "api_key"
});


function parseTwitterOauth(headers){
	return {
		token: headers.twitter_oauth_token,
		secret: headers.twitter_oauth_token_secret
	};
};

function parseFbOauth(headers){
	return {
		token : headers.fb_access_token
	};
};


// ==================  configure routes  ==================
var api_base_address = "/api/v0";

app.get(api_base_address + "/twitter/following", auth_local_api_key, function(req, res){
	getTwitterConfig(function(config){
		twitter.getFollowing(config.oauth, parseTwitterOauth(req.headers), function(following){
			res.send(following);
		});
	});
});

app.get(api_base_address + "/twitter/followers", auth_local_api_key, function(req, res){
	getTwitterConfig(function(config){
		twitter.getFollowers(config.oauth, parseTwitterOauth(req.headers), function(followers){
			res.send(followers);
		});
	});
});

app.get(api_base_address + "/twitter/friends", auth_local_api_key, function(req, res){
	getTwitterConfig(function(config){
		twitter.getFriends(config.oauth, parseTwitterOauth(req.headers), function(friends){
			res.send(friends);
		});
	});
});

app.get(api_base_address + "/twitter/trends", auth_local_api_key, function(req, res){
	getTwitterConfig(function(config){
		twitter.getTrends(config.oauth, parseTwitterOauth(req.headers), function(trends){
			res.send(trends);
		});
	});
});

app.get(api_base_address + "/twitter/me", auth_local_api_key, function(req, res){
	getTwitterConfig(function(config){
		twitter.getMe(config.oauth, parseTwitterOauth(req.headers), function(user){
			res.send(user);
		});
	});
});

app.post(api_base_address + "/twitter/status", auth_local_api_key, function(req, res){
	getTwitterConfig(function(config){
		twitter.postStatus(config.oauth, parseTwitterOauth(req.headers), req.body.status, function(tweet){
			res.send(tweet);
		});
	});
});

app.get(api_base_address + "/fb/me", auth_local_api_key, function(req, res){
	getFacebookConfig(function(config){
		fb.getMe(config, parseFbOauth(req.headers), function(profile){
			res.send(profile);
		});
	});
});

app.get(api_base_address + "/fb/friends", auth_local_api_key, function(req, res){
	getFacebookConfig(function(config){
		fb.getFriends(config, parseFbOauth(req.headers), function(friends){
			res.send(friends);
		});
	});
});

app.get(api_base_address + "/fb/feeds", auth_local_api_key, function(req, res){
	getFacebookConfig(function(config){
		fb.getFeeds(config, parseFbOauth(req.headers), function(feeds){
			res.send(feeds);
		});
	});
});

app.get(api_base_address + "/fb/permissions", auth_local_api_key, function(req, res){
	getFacebookConfig(function(config){
		fb.getPermissions(config, parseFbOauth(req.headers), function(permissions){
			res.send(permissions);
		});
	});
});

app.delete(api_base_address + "/fb/permissions", auth_local_api_key, function(req, res){
	getFacebookConfig(function(config){
		fb.deletePermissions(config, parseFbOauth(req.headers), function(permissions){
			res.send(permissions);
		});
	});
});

app.post(api_base_address + "/fb/status", auth_local_api_key, function(req, res){
	getFacebookConfig(function(config) {
		fb.postStatus(config, parseFbOauth(req.headers), req.body.status, function(permissions){
			res.send(permissions);
		});
	});
});


app.get("/api/consumers", function(req, res){
	Consumer.find({}, {_id : 0, __v:0}, function(dbErr, consumers){
		if(dbErr) {throw dbErr};
		res.send(consumers);
	});
});

app.post("/api/key/:api_key/update_authorized", function(req, res){
	var api_key = req.params.api_key;
	var authorized = req.body.authorized;
	console.log("Trying to set authorization for " + api_key + " to " + authorized);

	var conditions = {api_key : api_key};
	var update = {$set : {authorized : authorized}};
	var options = {new : true, select:{_id : 0, __v:0}};

	Consumer.findOneAndUpdate(conditions, update, options, function(err, consumer){
		if(err){ throw err; }
		res.send(consumer);
	});
});

app.get("/api/key/:api_key/authorized", function(req, res){
	var api_key = req.params.api_key;
	console.log("Checking for validity of api_key " + api_key);
	checkAPIKey(api_key, function(err, consumer){
		if(err){
			res.status(401);
			res.json(err);
		} else {
			res.send(consumer);
		}
	});
});


app.get("/api/key", function(req, res){
	console.log("Request for api-key..");
	var consumer = createAPIConsumer(req.query);
	consumer.save(function(err){
		if(!err){
			res.send("Done.")
		} else {
			console.log(err);
			res.send(err);
		}
	});
});


// ==================  start the server  ==================

var server = app.listen(8000, function(){
	var host = server.address().adress;
	var port = server.address().port;

	console.log("App is listening at http://%s:%s", host, port);
});


