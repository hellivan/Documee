var express = require("express");
var Twitter = require("twitter");
var app = express();

var conf = {};

conf.twitter = {};

conf.twitter.consumer_key = "r6uKNLSHibUkIxTHqkKGftZgd";
conf.twitter.consumer_secret = "V6sAHyGqmAutcCu51RLvO8mZoNR996XByBXW2j6LKK22QXiaMP";
conf.twitter.access_token_key = "2689340107-mHDxktHSHjFC65jENOwONuSF2vJCxgrQJiyKzLr";
conf.twitter.access_token_secret = "8egHFAyEkI4x7oFAzGHVblAFKQkjv9JKVtTECm3gGmF7c";




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
	client.get('friends/list', {}, function(error, data, response){
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
	client.get('followers/list', {}, function(error, data, response){
		if(error) throw error;
		//console.log(data);
		var persons = [];
		for (var index in data.users){
			persons.push(getPerson(data.users[index]));
		}
		callback(persons);
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


app.get("/following", function(req, res){

	getTwitterFollowing(function(persons){
		var response = {
			count   : persons.length,
			persons : persons
		}
		res.send(response);
	});
});

app.get("/followers", function(req, res){

	getTwitterFollowers(function(persons){
		var response = {
			count   : persons.length,
			persons : persons
		}
		res.send(response);
	});
});

app.get("/friends", function(req, res){

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



var server = app.listen(8000, function(){
	var host = server.address().adress;
	var port = server.address().port;

	console.log("App is listening at http://%s:%s", host, port);
})
