
function getGraph(app_oauth, user_oauth){
    console.log("Creating facebook client with:" +
        "\napp_oauth: " + app_oauth.client_secret +
        "\nuser_oauth: " + user_oauth.token);
    var graph = require('fbgraph');
    graph.setAppSecret(app_oauth.client_secret);
    graph.setAccessToken(user_oauth.token);
    return graph;
};


module.exports = function(normalizer){

  return {
      deletePermissions : function(app_oauth, user_oauth, callback){
          var graph = getGraph(app_oauth, user_oauth);
          graph.del("me/permissions", function(err, fb_res) {
              callback(fb_res);
          });
      },

      postStatus : function(app_oauth, user_oauth, status, callback){
          var params = {};
          params.message = status;

          var graph = getGraph(app_oauth, user_oauth);
          graph.post("/feed", params, function(err, fb_res) {
              callback(fb_res);
            });
      },

      getPermissions : function(app_oauth, user_oauth, callback) {
          var params = {};
          //params.fields = "picture";

          var graph = getGraph(app_oauth, user_oauth);
          graph.get("me/permissions", params, function (err, fb_res) {
              callback(fb_res.data);
          });
      },

      getFriends : function (app_oauth, user_oauth, callback){
          var params = {};
          //params.fields = "picture";
          var friends = [];

          var paging_cb = function (err, fb_res){
              for (var index in fb_res.data){
                  friends.push(normalizer.normalizeFriend("facebook", fb_res.data[index]));
              }

              if(fb_res.paging && fb_res.paging.next){
                  graph.get(fb_res.paging.next, params, paging_cb);
              } else {
                  callback(friends);
              }
          };

          var graph = getGraph(app_oauth, user_oauth);
          graph.get("me/taggable_friends", params, paging_cb);
      },

      getMe : function (app_oauth, user_oauth, callback){
          var params = {};
          params.fields = "birthday, picture, email, first_name, last_name, gender, id, link, locale, name";

          var graph = getGraph(app_oauth, user_oauth);
          graph.get("me", params, function(err, fb_res) {
              callback(normalizer.normalizeProfile("facebook", fb_res));
          });
      },

      getFeeds : function(app_oauth, user_oauth, callback){
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
      }
  };
};