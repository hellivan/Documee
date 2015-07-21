var appControllers = angular.module('apitest.controllers', ['apitest.services', 'ui.bootstrap']);


appControllers.controller("apitest.MixController", function ($log, $http, $scope, $rootScope, $authentication, $apiKey) {
    var api_base_address = "http://localhost:8000/api/v0/";

    $scope.providers = ['facebook', 'twitter'];
    $scope.useProvider = {};


    $scope.isAuthenticated = function(provider){
        return $authentication.isAuthenticated(provider);
    }

    $scope.progState = {
        states : [
            {
                name: 'get_me',
                description: 'Fetch profile-infos',
                api : {
                    method : 'get',
                    call : api_base_address + 'providers/me'
                },
                template : 'partials/mixed/user-profile.html'
            },
            {
                name: 'get_friends',
                description: 'Fetch friends',
                api : {
                    method : 'get',
                    call : api_base_address + 'providers/friends'
                },
                template : 'partials/mixed/friends-list.html'
            },
        ],
        current : undefined
    };

    $scope.switchState = function(newState){
        $scope.data = undefined;
        $scope.progState.current = undefined;

        if(newState){
            if(newState.api){
                var queryProviders = [];

                $scope.providers.forEach(function(provider){
                    if($scope.isAuthenticated(provider) && $scope.useProvider[provider]){
                        queryProviders.push(provider);
                    }
                });
                $log.debug(queryProviders);

                $http[newState.api.method](newState.api.call, {params: {providers:queryProviders}}).
                    success(function(data, status, headers, config) {
                        $log.debug("Success: " + JSON.stringify(data));
                        $scope.data = data;
                        $scope.progState.current = newState.name;
                        $apiKey.setError();
                    }).
                    error(function(data, status, headers, config) {
                        $log.debug("Error: " + JSON.stringify(data));
                        if(status === 401){
                            if(data.type === "KEY"){
                                $apiKey.setError(data.message);
                            }
                        }
                    });
            } else if(newState.template) {
                $scope.progState.current = newState.name;
            }
        }
    };


    $log.debug("Loaded apitest.MixController");
});


appControllers.controller("apitest.BaseController", function ($log, $http, $scope, $rootScope, $authentication, $apiKey) {
    var api_base_address = "http://localhost:8000/api/v0/";
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
        $scope.data_fb = undefined;
        $scope.fbstate.current = undefined;

        if(state){
            if(state.api){
                $http[state.api.method](state.api.call).
                    success(function(data, status, headers, config) {
                        $log.debug("Success: " + JSON.stringify(data));
                        $scope.data_fb = data;
                        $scope.fbstate.current = state.name;
                        $apiKey.setError();
                    }).
                    error(function(data, status, headers, config) {
                        $log.debug("Error: " + JSON.stringify(data));
                        if(status === 401){
                            if(data.type === "KEY"){
                                $apiKey.setError(data.message);
                            }
                        }
                    });
            } else if(state.template) {
                $scope.fbstate.current = state.name;
            }
        }
    };

    $scope.switchTwitterState = function(state){
        $scope.data_twitter = undefined;
        $scope.twitterstate.current = undefined;

        if(state){
            if(state.api){
                $http[state.api.method](state.api.call).
                    success(function(data, status, headers, config) {
                        $log.debug(data);
                        $scope.data_twitter = data;
                        $scope.twitterstate.current = state.name;
                        setKeyError();
                    }).
                    error(function(data, status, headers, config) {
                        $log.debug("Error: " + data);
                        if(status === 401){
                            if(data.type === "KEY"){
                                setKeyError(data.message);
                            }
                        }
                    });
            } else if(state.template) {
                $scope.twitterstate.current = state.name;
            }
        }
    };


    $scope.loginTwitter = function(){
        OAuth.popup('twitter', {cache: false}).done(function(result) {
            $log.debug("Authenticated with twitter");
            $log.debug(result);
            $authentication.setCredentials('twitter', {
                oauth_token: result.oauth_token,
                oauth_token_secret: result.oauth_token_secret
            }, true, true);
        });
    };

    $scope.loginFacebook = function(){
        OAuth.popup('facebook', {cache: false}).done(function(result) {
            $log.debug("Authenticated with facebook");
            $log.debug(result);
            $authentication.setCredentials('facebook', {
                access_token: result.access_token,
                token_type: result.token_type,
                expires_in: result.expires_in
            }, true, true);
        });
    };

    $log.debug("Started controller apitest.BaseController")
});

appControllers.controller("apitest.PostFbStatusController", function($http, $scope, $apiKey){
    var api_base_address = "http://localhost:8000/api/v0/"

    $scope.status = undefined;

    $scope.postStatus = function(){
        $http.post(api_base_address + "fb/status", {status: $scope.status}).
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.status = undefined;
                $apiKey.setError();
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
                if(status === 401){
                    if(data.type === "KEY"){
                        $apiKey.setError(data.message);
                    }
                }
            });
    };
});

appControllers.controller("apitest.PostTwitterStatusController", function($http, $scope, $apiKey ){
    var api_base_address = "http://localhost:8000/api/v0/"

    $scope.status = undefined;

    $scope.postStatus = function(){
        $http.post(api_base_address + "twitter/status", {status: $scope.status}).
            success(function(data, status, headers, config) {
                console.log(data);
                $scope.status = undefined;
                $apiKey.setError();
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
                if(status === 401){
                    if(data.type === "KEY"){
                        $apiKey.setError(data.message);
                    }
                }
            });
    };
});

appControllers.controller('apitest.NavbarController', function($scope, $http, $rootScope, $modal){
    $scope.showKeyDialog = function(size){
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'apitest/views/dialogs/change-api-key.html',
            controller: 'apitest.ChangeApiKeyController',
            size: size,
            resolve: {
                api_key: function () {
                    return $rootScope.api_key;
                }
            }
        });

        modalInstance.result.then(function (api_key) {
            updateApiKey(api_key);
        }, function (param) {
            console.log('Modal dismissed at: ' + new Date() +" - " +param);
        });

    };

    function updateApiKey (api_key){
        $rootScope.api_key = api_key;
        $http.defaults.headers.common.api_key = api_key;
    };

    updateApiKey("a43d4cda-fecf-44e6-b351-71f6ffc1f7f7");
});


appControllers.controller('apitest.ChangeApiKeyController', function($scope, $modalInstance, api_key) {
    $scope.api_key = api_key;


    $scope.save = function(){
        $modalInstance.close($scope.api_key);
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('user - cancel');
    };

});