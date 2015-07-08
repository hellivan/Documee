
var stub = {};

function getGraph(app_oauth, user_oauth){
    var graph = require('fbgraph');
    graph.setAppSecret(app_oauth.client_secret);
    graph.setAccessToken(user_oauth.token);
    return graph;
};

stub.getMe = function (app_oauth, user_oauth, callback){
    var params = {};
    params.fields = "birthday, picture, email, first_name, last_name, gender, id, link, locale, name";

    var graph = getGraph(app_oauth, user_oauth);
    graph.get("me", params, function(err, fb_res) {
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
        callback(profile);
    });
};

stub.getFriends = function (app_oauth, user_oauth, callback){
    var params = {};
    //params.fields = "picture";
    var friends = [];

    var paging_cb = function (err, fb_res){
        for (var index in fb_res.data){
            friends.push({
                name : fb_res.data[index].name,
                picture : fb_res.data[index].picture.data.url
            });
        }

        if(fb_res.paging && fb_res.paging.next){
            graph.get(fb_res.paging.next, params, paging_cb);
        } else {
            callback(friends);
        }
    };

    var graph = getGraph(app_oauth, user_oauth);
    graph.get("me/taggable_friends", params, paging_cb);
}

stub.getFeeds = function(app_oauth, user_oauth, callback){
    var params = {};
    //params.fields = "picture";

    var feeds = [];
    var paging_cb = function (err, fb_res){
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
            graph.get(fb_res.paging.next, params, paging_cb);
        } else {
            callback(feeds);
        }
    };

    var graph = getGraph(app_oauth, user_oauth);
    graph.get("me/feed", params, paging_cb);
};

stub.getPermissions = function(app_oauth, user_oauth, callback){
    var params = {};
    //params.fields = "picture";

    var graph = getGraph(app_oauth, user_oauth);
    graph.get("me/permissions", params, function(err, fb_res) {
        callback(fb_res.data);
    });
};

stub.postStatus = function(app_oauth, user_oauth, status, callback){
    var params = {};
    params.message = status;

    var graph = getGraph(app_oauth, user_oauth);
    graph.post("/feed", params, function(err, fb_res) {
        callback(fb_res);
    });
};

stub.deletePermissions = function(app_oauth, user_oauth, callback){
    var graph = getGraph(app_oauth, user_oauth);
    graph.del("me/permissions", function(err, fb_res) {
        callback(fb_res);
    });
};

module.exports = stub;