var app = angular.module('documee_demo', ['ui.bootstrap', 'ngFacebook']);



app.config(
    function( $facebookProvider) {
        $facebookProvider.setAppId("1136006799750257");
        $facebookProvider.setPermissions([
            "public_profile",
            "email",
            "user_friends",
            "read_custom_friendlists",
            "user_likes",
            "user_about_me",
            "user_birthday",
            "user_location",
            "user_posts"
        ]);
    }
);

app.controller("mainController", function ($http, $scope, $facebook) {


    OAuth.initialize("U7oog1cN5o_ZsjeoQ_rPOxbFaKA");


    $scope.fb_access_token = undefined;
    $scope.twitter_access_token = undefined;


    $scope.isFacebookLoggedIn = false;
    $scope.isTwitterLoggedIn = false;


    function set_fb_credentials(accessToken){
        $scope.fb_access_token = accessToken;
        $http.defaults.headers.common.fb_access_token = accessToken;
    }

    $scope.loginTwitter = function(){
        OAuth.popup('twitter').done(function(result) {
            console.log("Authenticated with twitter");
            console.log(result);
        })
    };

    $scope.loginFacebook = function(){
        OAuth.popup('facebook').done(function(result) {
            console.log("Authenticated with facebook");
            console.log(result);
        })
    };

    $scope.login = function(){
        $facebook.login().then(function(response) {
            refresh();
        });
    };

    function refresh() {
        console.log("Called refresh");
        $facebook.api("/me").then(
            function(res) {
                set_fb_credentials($facebook.getAuthResponse().accessToken);
                $scope.isFacebookLoggedIn = true;
            }
        );
    };

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
