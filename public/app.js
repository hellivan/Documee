var app = angular.module('documee_demo', ['ui.bootstrap']);




app.controller("mainController", function ($http, $scope, $rootScope) {


    OAuth.initialize("U7oog1cN5o_ZsjeoQ_rPOxbFaKA");


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
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            }
        );
    };


});
