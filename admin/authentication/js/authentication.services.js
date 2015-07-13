var appServices = angular.module('authentication.services', []);

appServices.factory("AuthenticationService",
function($http, $rootScope){
    var service = {};
    var api_base_address = "http://localhost:8000/";

    service.login = function (username, password, callback){
        $http.post(api_base_address + 'api/authenticate', { username: username, password: password })
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

