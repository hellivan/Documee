var Twitter = require('twitter')

function getTwitterClient(app_oauth, user_oauth){
    console.log("Creating twitter client with:" +
        "\napp_oauth: " + app_oauth.client_id + " - " + app_oauth.client_secret +
        "\nuser_oauth: " + user_oauth.token + " - " + user_oauth.secret);
    return new Twitter({
        consumer_key: app_oauth.client_id,
        consumer_secret: app_oauth.client_secret,
        access_token_key: user_oauth.token,
        access_token_secret: user_oauth.secret
    });
};


function mergePersonsLists(persons1, persons2){
    var merged = [];
    for (var index1 in persons1){
        var person1 = persons1[index1];
        for (var index2 in persons2){
            var person2 = persons2[index2];
            if (person1.id == person2.id){
                merged.push(person1);
            }
        }
    }
    return merged;
};

function getFollowing(app_oauth, user_oauth, normalizer, callback){
    var client = getTwitterClient(app_oauth, user_oauth);
    client.get('friends/list', {count:200}, function(error, data, response){
        if(error) throw error;
        var persons = [];
        for (var index in data.users){
            persons.push(normalizer.normalizeFriend("twitter", data.users[index]));
        }
        callback(persons);
    });
};

function getFollowers(app_oauth, user_oauth, normalizer, callback){
    var client = getTwitterClient(app_oauth, user_oauth);
    client.get('followers/list', {count:200}, function(error, data, response){
        if(error) throw error;
        var persons = [];
        for (var index in data.users){
            persons.push(normalizer.normalizeFriend("twitter", data.users[index]));
        }
        callback(persons);
    });
};

module.exports = function(normalizer){
    return{
        getFollowing : function(app_oauth, user_oauth, callback){
            getFollowing(app_oauth, user_oauth, normalizer, callback);
        },

        getFollowers : function(app_oauth, user_oauth, callback){
            getFollowers(app_oauth, user_oauth, normalizer, callback);
        },

        getTrends : function(app_oauth, user_oauth, callback){
            var client = getTwitterClient(app_oauth, user_oauth);
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
        },

        getMe : function(app_oauth, user_oauth, callback){
            var client = getTwitterClient(app_oauth, user_oauth);
            client.get("account/verify_credentials", {}, function(error, data, response){
                if(error) throw error;
                callback(normalizer.normalizeProfile("twitter", data));
            });
        },

        postStatus : function(app_oauth, user_oauth, status, callback){
            var client = getTwitterClient(app_oauth, user_oauth);
            client.post('statuses/update', {status: status},  function(error, tweet, response){
                if(error) throw error;
                callback(tweet);
            });
        },

        getFriends : function(app_oauth, user_oauth, callback){
            getFollowers(app_oauth, user_oauth, normalizer, function(followers){
                getFollowing(app_oauth, user_oauth, normalizer, function(following){
                    var friends = mergePersonsLists(followers, following);
                    callback(friends);
                });
            });
        }
    }
};