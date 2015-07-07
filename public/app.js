var app = angular.module('documee_demo', ['ui.bootstrap', 'ui.router']);

app.controller("PostFbStatusController", function($http, $scope ){
    var api_base_address = "http://localhost:8000/"

    $scope.status = undefined;

    $scope.postStatus = function(){
        $http.post(api_base_address + "fb/status", {status: $scope.status}).
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.status = undefined;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            });
    };
});

app.controller("PostTwitterStatusController", function($http, $scope ){
    var api_base_address = "http://localhost:8000/"

    $scope.status = undefined;

    $scope.postStatus = function(){
        $http.post(api_base_address + "twitter/status", {status: $scope.status}).
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.status = undefined;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            });
    };
});

app.controller("mainController", function ($http, $scope, $rootScope) {
    var api_base_address = "http://localhost:8000/"

    OAuth.initialize("U7oog1cN5o_ZsjeoQ_rPOxbFaKA");

    $scope.fbstate = {
        states : [
            {
                name: 'get_permissions',
                description: 'Fetch all app-permissions',
                api : {
                    method : 'get',
                    call : api_base_address + 'fb/permissions'
                },
                template : 'partials/facebook/permissions-list.html'
            },
            {
                name: 'delete_permissions',
                description: 'Delete all Facebook app-permissions',
                api : {
                    method : 'delete',
                    call : api_base_address + 'fb/permissions'
                }
            },
            {
                name: 'get_friends',
                description: 'Fetch tagable friends from Facebook',
                api : {
                    method : 'get',
                    call : api_base_address + 'fb/friends'
                },
                template : 'partials/facebook/friends-list.html'
            },
            {
                name: 'get_me',
                description: 'Fetch profile-infos from Facebook',
                api : {
                    method : 'get',
                    call : api_base_address + 'fb/me'
                },
                template : 'partials/facebook/user-profile.html'
            },
            {
                name: 'get_feeds',
                description: 'Fetch latest feeds on Facebook',
                api : {
                    method : 'get',
                    call : api_base_address + 'fb/feeds'
                },
                template : 'partials/facebook/feeds-list.html'
            },
            {
                name : 'post_status',
                description : 'Post status-update on facebook',
                template : 'partials/facebook/post-update.html'
            }

        ],
        current : undefined
    };

    $scope.twitterstate = {
        states : [
            {
                name: 'get_friends',
                description: 'Fetch friends on twitter',
                api : {
                    method : 'get',
                    call : api_base_address + 'twitter/friends'
                },
                template : 'partials/twitter/friends-list.html'
            },
            {
                name: 'delete_following',
                description: 'Fetch people following on twitter',
                api : {
                    method : 'get',
                    call : api_base_address + 'twitter/following'
                },
                template : 'partials/twitter/friends-list.html'
            },
            {
                name: 'get_followers',
                description: 'Fetch followers on twitter',
                api : {
                    method : 'get',
                    call : api_base_address + 'twitter/followers'
                },
                template : 'partials/twitter/friends-list.html'
            },
            {
                name: 'get_trends',
                description: 'Fetch top 10 trends on twitter',
                api : {
                    method : 'get',
                    call : api_base_address + 'twitter/trends'
                },
                template : 'partials/twitter/trends-list.html'
            },
            {
                name : 'get_user',
                description : 'Fetch user information on twitter',
                api : {
                    method : 'get',
                    call : api_base_address + 'twitter/me'
                },
                template : 'partials/twitter/user-profile.html'
            },
            {
                name : 'post_status',
                description : 'Post status-update on twitter',
                template : 'partials/twitter/post-update.html'
            }
        ],
        current : undefined
    };

    $scope.switchFbState = function(state){
        $scope.fb_result = undefined;
        $scope.fbstate.current = undefined;

        if(state){
            if(state.api){
                $http[state.api.method](state.api.call).
                    success(function(data, status, headers, config) {
                        console.log(data);
                        $scope.data_fb = data;
                        $scope.fbstate.current = state.name;
                    }).
                    error(function(data, status, headers, config) {
                        console.log("Error: " );
                        console.log(data);
                    });
            } else if(state.template) {
                $scope.fbstate.current = state.name;
            }
        }
    };

    $scope.switchTwitterState = function(state){
        $scope.twitter_result = undefined;
        $scope.twitterstate.current = undefined;

        if(state){
            if(state.api){
                $http[state.api.method](state.api.call).
                    success(function(data, status, headers, config) {
                        console.log(data);
                        $scope.data_twitter = data;
                        $scope.twitterstate.current = state.name;
                    }).
                    error(function(data, status, headers, config) {
                        console.log("Error: " + data);
                    });
            } else if(state.template) {
                $scope.twitterstate.current = state.name;
            }
        }
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
        OAuth.popup('twitter', {cache: false}).done(function(result) {
            console.log("Authenticated with twitter");
            console.log(result);
            set_twitter_credentials(result.oauth_token, result.oauth_token_secret);
            $rootScope.$apply();
        });
    };

    $scope.loginFacebook = function(){
        OAuth.popup('facebook', {cache: false}).done(function(result) {
            console.log("Authenticated with facebook");
            console.log(result);
            set_fb_credentials(result.access_token);
            $rootScope.$apply();
        });
    };
});
