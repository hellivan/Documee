var app = angular.module('documee_demo', ['ui.bootstrap', 'ui.router']);


app.config(function($stateProvider){

});



app.controller("mainController", function ($http, $scope, $rootScope) {


    OAuth.initialize("U7oog1cN5o_ZsjeoQ_rPOxbFaKA");

    $scope.fbstate = {
        states : [
            {
                name: 'get_permissions',
                description: 'Fetch all app-permissions',
                method: 'get_fb_permissions',
                template : 'partials/facebook/permissions-list.html'
            },
            {
                name: 'delete_permissions',
                description: 'Delete all Facebook app-permissions',
                method: 'delete_fb_permissions'
            },
            {
                name: 'get_friends',
                description: 'Fetch tagable friends from Facebook',
                method: 'get_fb_friends',
                template : 'partials/facebook/friends-list.html'
            },
            {
                name: 'get_me',
                description: 'Fetch profile-infos from Facebook',
                method: 'get_fb_me',
                template : 'partials/facebook/user-profile.html'
            },
            {
                name: 'get_feeds',
                description: 'Fetch latest feeds on Facebook',
                method: 'get_fb_feeds',
                template : 'partials/facebook/feeds-list.html'
            },

        ],
        current : undefined
    };

    $scope.twitterstate = {
        states : [
            {
                name: 'get_friends',
                description: 'Fetch friends on twitter',
                method: 'get_twitter_friends',
                template : 'partials/twitter/friends-list.html'
            },
            {
                name: 'delete_following',
                description: 'Fetch people following on twitter',
                method: 'get_twitter_following',
                template : 'partials/twitter/friends-list.html'
            },
            {
                name: 'get_followers',
                description: 'Fetch followers on twitter',
                method: 'get_twitter_followers',
                template : 'partials/twitter/friends-list.html'
            },
            {
                name: 'get_trends',
                description: 'Fetch top 10 trends on twitter',
                method: 'get_twitter_trends',
                template : 'partials/twitter/trends-list.html'
            }

        ],
        current : undefined
    };

    $scope.switchFbState = function(state){
        $scope.fb_result = undefined;
        $scope.fbstate.current = state.name;
        $scope[state.method]();
    };

    $scope.switchTwitterState = function(state){
        $scope.twitter_result = undefined;
        $scope.twitterstate.current = state.name;
        $scope[state.method]();
    };

    $scope.auth = {};

    $scope.auth.fb ={
        authenticated : false,
        credentials : {}
    };

    $scope.auth.twitter ={
        authenticated : false,
        credentials : {}
    };

    function set_fb_credentials(access_token){
        $scope.auth.fb.authenticated = true;
        $scope.auth.fb.credentials.access_token = access_token;
        $http.defaults.headers.common.fb_access_token = access_token;
    }

    function set_twitter_credentials(oauth_token, oauth_token_secret){
        $scope.auth.twitter.authenticated = true;
        $scope.auth.twitter.credentials.oauth_token = oauth_token;
        $scope.auth.twitter.credentials.oauth_token_secret = oauth_token_secret;
        $http.defaults.headers.common.twitter_oauth_token = oauth_token;
        $http.defaults.headers.common.twitter_oauth_token_secret = oauth_token_secret;
    }



    $scope.loginTwitter = function(){
        OAuth.popup('twitter').done(function(result) {
            console.log("Authenticated with twitter");
            console.log(result);
            set_twitter_credentials(result.oauth_token, result.oauth_token_secret);
            $rootScope.$apply();
        });
    };

    $scope.loginFacebook = function(){
        OAuth.popup('facebook').done(function(result) {
            console.log("Authenticated with facebook");
            console.log(result);
            set_fb_credentials(result.access_token);
            $rootScope.$apply();
        });
    };

    //$scope.login = function(){
    //    $facebook.login().then(function(response) {
    //        refresh();
    //    });
    //};

    //function refresh() {
    //    console.log("Called refresh");
    //    $facebook.api("/me").then(
    //        function(res) {
    //            set_fb_credentials($facebook.getAuthResponse().accessToken);
    //            $scope.isFacebookLoggedIn = true;
    //        }
    //    );
    //};

    //refresh();


    $scope.get_app_id = function(){
        $http.get("http://localhost:8000/api/fb").
            success(function(data, status, headers, config) {
                console.log("App ID is " + data.app_id);

            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_fb_me = function(){
        $http.get("http://localhost:8000/fb/me").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_fb = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " );
                console.log(data);
            }
        );
    };

    $scope.get_fb_friends = function(){
        $http.get("http://localhost:8000/fb/friends").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_fb = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_fb_feeds = function(){
        $http.get("http://localhost:8000/fb/feeds").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_fb = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_fb_permissions = function(){
        $http.get("http://localhost:8000/fb/permissions").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_fb = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.delete_fb_permissions = function(){
        $http.delete("http://localhost:8000/fb/permissions").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.fb_result = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_twitter_followers = function(){
        $http.get("http://localhost:8000/twitter/followers").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_twitter = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_twitter_following = function(){
        $http.get("http://localhost:8000/twitter/following").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_twitter = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_twitter_friends = function(){
        $http.get("http://localhost:8000/twitter/friends").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_twitter = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };

    $scope.get_twitter_trends = function(){
        $http.get("http://localhost:8000/twitter/trends").
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.data_twitter = data;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };


});
