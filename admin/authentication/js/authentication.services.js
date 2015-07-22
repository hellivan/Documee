var appServices = angular.module('authentication.services', ['DocumeeServices']);

appServices.factory("AuthenticationService",
function($http, $rootScope, $documeeApi){
    var service = {};

    service.login = function (username, password, callback){
        $http.post($documeeApi.hostAddress + 'api/authenticate', { username: username, password: password })
        .success(function (data, status, headers, config) {
            callback(null, data);
        })
        .error(function(data, status, headers, config) {
            callback(data);
        });
    };

    service.setCredentials = function (user) {
        if(!$rootScope.globals){
            $rootScope.globals ={};
        }
        $rootScope.globals.logged_in = true;
    };

    service.clearCredentials = function () {
        if($rootScope.globals){
            delete $rootScope.globals.logged_in;
        }
    };

    return service;
});

