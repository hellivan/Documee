var express = require('express');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');

var normalizer = require('./tools/normalization')();

var twitter = require('./data_providers/twitter')(normalizer);
var fb = require('./data_providers/facebook')(normalizer);

var consumerModel = require('./models/consumer');
var userModel = require('./models/user');
var providerModel = require('./models/config/providers');

var uuid = require('node-uuid');

var passport = require('passport');
var LocalApiKeyStrategy = require('passport-localapikey-update').Strategy;
var LocalPassStrategy = require('passport-local').Strategy;

var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

// ==================  configure mongoose and its models  ==================
mongoose.connect('mongodb://localhost/documee_proto');
var User = userModel(mongoose);
var Consumer = consumerModel(mongoose);
var Provider = providerModel(mongoose);


// ==================  configure passport   ==================
passport.serializeUser(function(user, done) {
	console.log("Serializing user ");
	console.log(user);
  	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  	console.log("Deserializing user with id " + id);
	User.findById(id, function (err, user) {
		console.log("Deserialized user ");
		console.log(user);
    	done(err, user);
  	});
});

passport.use(new LocalApiKeyStrategy({apiKeyHeader: "api_key"}, function(api_key, done) {
	console.log("Checking validity of key " + api_key);
	checkAPIKey(api_key, function(err, consumer){
		console.log("Error is: " + JSON.stringify(err));
		if (err) { return done(err); }
		return done(null, consumer);
	});
}));


passport.use(new LocalPassStrategy(function(username, password, done) {
	console.log("Checking user authentication for " + username + " " + password);
	var credentials = {
		username: username,
		password: password
	};
	User.findOne(credentials, function (err, user) {
		done(err, user);
	});
}));




// ==================  configure express  ==================
var app = express();
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(cookieParser());

app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

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



app.use(session({
	secret: 'this_is_a_nasty_secret',
	saveUninitialized: true,
 	resave: true,
	store: new MongoStore({mongooseConnection: mongoose.connection, 'db': 'sessions'}),
	cookie : {
		httpOnly: false,
		maxAge : 604800 // one week
	}
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../example'));

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
			type: "KEY",
			error : "INVALID",
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
				type: "KEY",
				error : "NOT_ACTIVATED",
				message : "Your API-key is not activated yet!"
			});
		}
		return callback({
			type: "KEY",
			error : "NOT_REGISTERED",
			message : "Your API-key is not registered!"
		});
	});
};

var auth_local_api_key = function(req, res, next){
	passport.authenticate('localapikey', function(err, user, info){
		if(err) {
			res.status(401);
			res.json(err);
		} else {
			next();
		}
	})(req, res, next);
};



var auth_local_pass = passport.authenticate('local');

UserAuthenticated = function (req, res, next){
	if(req.isAuthenticated()){
        next();
    }else{
		res.status(401);
		res.json('Not authorized!');
    }
};


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


var providers = {
	facebook : {
		getOauth : parseFbOauth,
		getConfig : getFacebookConfig,
		accessor : fb
	},
	twitter : {
		getOauth : parseTwitterOauth,
		getConfig : getTwitterConfig,
		accessor : twitter
	}
}

// ==================  configure routes  ==================
var api_base_address = "/api/v0";

app.all(api_base_address + "/*", function(req, res, next) {
	if(req.method === 'OPTIONS'){
		next();
	} else {
		auth_local_api_key(req, res, next);
	}
});

app.get(api_base_address + "/twitter/following",  function(req, res){
	getTwitterConfig(function(config){
		twitter.getFollowing(config.oauth, parseTwitterOauth(req.headers), function(following){
			res.send(following);
		});
	});
});

app.get(api_base_address + "/twitter/followers",  function(req, res){
	getTwitterConfig(function(config){
		twitter.getFollowers(config.oauth, parseTwitterOauth(req.headers), function(followers){
			res.send(followers);
		});
	});
});

app.get(api_base_address + "/twitter/friends",  function(req, res){
	getTwitterConfig(function(config){
		twitter.getFriends(config.oauth, parseTwitterOauth(req.headers), function(friends){
			res.send(friends);
		});
	});
});

app.get(api_base_address + "/twitter/trends",  function(req, res){
	getTwitterConfig(function(config){
		twitter.getTrends(config.oauth, parseTwitterOauth(req.headers), function(trends){
			res.send(trends);
		});
	});
});

app.get(api_base_address + "/twitter/me",  function(req, res){
	getTwitterConfig(function(config){
		twitter.getMe(config.oauth, parseTwitterOauth(req.headers), function(user){
			res.send(user);
		});
	});
});

app.post(api_base_address + "/twitter/status",  function(req, res){
	getTwitterConfig(function(config){
		twitter.postStatus(config.oauth, parseTwitterOauth(req.headers), req.body.status, function(tweet){
			res.send(tweet);
		});
	});
});

app.get(api_base_address + "/fb/me",  function(req, res){
	getFacebookConfig(function(config){
		fb.getMe(config.oauth, parseFbOauth(req.headers), function(profile){
			res.send(profile);
		});
	});
});

app.get(api_base_address + "/fb/friends",  function(req, res){
	getFacebookConfig(function(config){
		fb.getFriends(config.oauth, parseFbOauth(req.headers), function(friends){
			res.send(friends);
		});
	});
});

app.get(api_base_address + "/fb/feeds",  function(req, res){
	getFacebookConfig(function(config){
		fb.getFeeds(config.oauth, parseFbOauth(req.headers), function(feeds){
			res.send(feeds);
		});
	});
});

app.get(api_base_address + "/fb/permissions",  function(req, res){
	getFacebookConfig(function(config){
		fb.getPermissions(config.oauth, parseFbOauth(req.headers), function(permissions){
			res.send(permissions);
		});
	});
});

app.delete(api_base_address + "/fb/permissions",  function(req, res){
	getFacebookConfig(function(config){
		fb.deletePermissions(config.oauth, parseFbOauth(req.headers), function(permissions){
			res.send(permissions);
		});
	});
});

app.post(api_base_address + "/fb/status",  function(req, res){
	getFacebookConfig(function(config) {
		fb.postStatus(config.oauth, parseFbOauth(req.headers), req.body.status, function(permissions){
			res.send(permissions);
		});
	});
});

app.get(api_base_address + "/providers/me", function(req, res){
	var tmpProviders = [];
	if(typeof req.query.providers === 'string'){
		tmpProviders.push(req.query.providers);
	} else if(typeof req.query.providers === 'object'){
		tmpProviders = req.query.providers;
	}
	var configurations = [];
	var profiles = [];

	var configurationCallback = function(done){
		console.log("Providers " + tmpProviders + " still to process...");
		if(tmpProviders.length > 0){
			var provider = tmpProviders.shift();
			if(providers[provider]){
				console.log("Processing provider " + provider);
				providers[provider].getConfig(function(config){
					configurations.push(config);
					configurationCallback(done);
				});
			} else {
				console.log("Skipping provider " + provider);
				configurationCallback(done);
			}
		} else {
			done();
		}
	};

	var dataCallback = function(){
		if(configurations.length > 0){
			var config = configurations.shift();
			var provider = providers[config.provider_name];
			provider.accessor.getMe(config.oauth, provider.getOauth(req.headers), function(profile){
				profiles.push(profile);
				dataCallback();
			});
		} else {

			res.send(profiles);
		}
	};

	configurationCallback(dataCallback);

});

app.get(api_base_address + "/providers/friends", function(req, res){
	var tmpProviders = [];
	if(typeof req.query.providers === 'string'){
		tmpProviders.push(req.query.providers);
	} else if(typeof req.query.providers === 'object'){
		tmpProviders = req.query.providers;
	}
	var configurations = [];
	var friends = [];

	var configurationCallback = function(done){
		console.log("Providers " + tmpProviders + " still to process...");
		if(tmpProviders.length > 0){
			var provider = tmpProviders.shift();
			if(providers[provider]){
				console.log("Processing provider " + provider);
				providers[provider].getConfig(function(config){
					configurations.push(config);
					configurationCallback(done);
				});
			} else {
				console.log("Skipping provider " + provider);
				configurationCallback(done);
			}
		} else {
			done();
		}
	};

	var dataCallback = function(){
		if(configurations.length > 0){
			var config = configurations.shift();
			var provider = providers[config.provider_name];
			provider.accessor.getFriends(config.oauth, provider.getOauth(req.headers), function(providerFriends){
				friends = friends.concat(providerFriends);
				dataCallback();
			});
		} else {
			res.send(friends);
		}
	};

	configurationCallback(dataCallback);

});



// ==================== Public Methods ====================
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
	console.log("Request for api-key.. " + JSON.stringify(req.query));

	var consumer = createAPIConsumer(req.query);
	console.log("Generated user " + JSON.stringify(consumer));

	Consumer.findOne({email: consumer.email}, function (err, registeredConsumer) {
		if(!registeredConsumer){
			consumer.save(function(err, newConsumer){
				if(err){
					console.log(err);
					res.status(500);
					res.json({message: 'Database error!'});
				} else {
					res.send(newConsumer);
				}
			});
		} else {
			res.status(401);
			var message = {
				type: "EMAIL",
				error : "DUPLICATE",
				message : "Email '"+consumer.email+"' was already registered!"
			};
			res.json(message);
		}
	});

});

// ==================== Admin methods ====================
app.post("/api/authenticate", auth_local_pass, function(req, res){
	res.send(req.user);
});

app.get("/api/consumers", UserAuthenticated, function(req, res){
	Consumer.find({}, {_id : 0, __v:0}, function(dbErr, consumers){
		if(dbErr) {throw dbErr};
		res.send(consumers);
	});
});

app.post("/api/key/:api_key/update_authorized", UserAuthenticated, function(req, res){
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

// ==================  create admin-user  and insert example customer if not exists  ==================
User.update({username: 'admin'}, {$set : {password: 'admin'}}, {upsert: true}, function(err){});
var documeeExampleConsumer = {
	company_name: 'documee',
	email: 'example@documee.com',
	api_key: 'a43d4cda-fecf-44e6-b351-71f6ffc1f7f7',
	authorized: true
};
Consumer.update({email: documeeExampleConsumer.email}, {$set : documeeExampleConsumer}, {upsert: true}, function(err){});

// ==================  start the server  ==================
var server = app.listen(8000, function(){
	var host = server.address().adress;
	var port = server.address().port;

	console.log("App is listening at http://%s:%s", host, port);
});






