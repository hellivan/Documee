var appServices = angular.module('apitest.services', ['ngCookies', 'LocalStorageModule']);



appServices.factory('$authentication',
    function($log, $http, $rootScope, $cookies, localStorageService){
        var service = {};

        function updateHeaders(){
            if($rootScope.auth){
                if($rootScope.auth.facebook){
                    $http.defaults.headers.common.fb_access_token = $rootScope.auth.facebook.credentials.access_token;
                }
                if($rootScope.auth.twitter){
                    $http.defaults.headers.common.twitter_oauth_token = $rootScope.auth.twitter.credentials.oauth_token;
                    $http.defaults.headers.common.twitter_oauth_token_secret = $rootScope.auth.twitter.credentials.oauth_token_secret;
                }
            }
        }

        service.isAuthenticated = function(provider){
            if($rootScope.auth){
                if($rootScope.auth[provider]){
                    return $rootScope.auth[provider].authenticated;
                }
            }
            return false;
        }

        service.setCredentials = function (provider, credentials, persistent, apply) {
            $log.debug('Setting credential for ' + provider + ' to ' + JSON.stringify(credentials));
            if(!$rootScope.auth){
                $rootScope.auth ={};
            }
            $rootScope.auth[provider] = {
                authenticated : true,
                credentials : credentials
            };

            updateHeaders();

            if(persistent){
                $log.debug('Persisting auth ' + JSON.stringify($rootScope.auth) + ' to local storage...');
                localStorageService.set('auth', $rootScope.auth);
            }
            if(apply){
                $log.debug('Calling apply for rootScope');
                $rootScope.$apply();
            }
        };

        service.restoreCredentials = function(){
            var auth = localStorageService.get('auth');
            $log.debug('Auth is ' +  JSON.stringify(auth));
            if(auth){
                for(var provider in auth){
                    service.setCredentials(provider, auth[provider].credentials);
                }
            }

        };

        service.clearCredentials = function (provider) {
            if($rootScope.auth){
                if(provider){
                    delete $rootScope.auth[provider];
                } else {
                    delete $rootScope.auth;
                }
            }
            $cookies.put('auth', $rootScope.auth);
        };

        return service;
    });

appServices.factory('$apiKey',
    function($log, $rootScope){
        var service = {};

        service.setError = function(message){
            $rootScope.key_error = message;
            if(message){
                $rootScope.keyStyle = "red";
            } else {
                delete $rootScope.keyStyle;
            }
        };


        return service;
    });