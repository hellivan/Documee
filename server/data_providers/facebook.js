

exports.getMe = function (graph, access_token, callback){
    var params = {};
    params.fields = "birthday, picture, email, first_name, last_name, gender, id, link, locale, name";

    graph.setAccessToken(access_token);
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

exports.getFriends = function (graph, access_token, callback){
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

    graph.setAccessToken(access_token);
    graph.get("me/taggable_friends", params, paging_cb);
}

exports.getFeeds = function(graph, access_token, callback){
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


    graph.setAccessToken(access_token);
    graph.get("me/feed", params, paging_cb);
};

exports.getPermissions = function(graph, access_token, callback){
    var params = {};
    //params.fields = "picture";

    graph.setAccessToken(access_token);
    graph.get("me/permissions", params, function(err, fb_res) {
        callback(fb_res.data);
    });
};

exports.postStatus = function(graph, access_token, status, callback){
    var params = {};
    params.message = status;

    graph.setAccessToken(access_token);
    graph.post("/feed", params, function(err, fb_res) {
        callback(fb_res);
    });
};

exports.deletePermissions = function(graph, access_token, callback){
    graph.setAccessToken(access_token);
    graph.del("me/permissions", function(err, fb_res) {
        callback(fb_res);
    });
}