var appServices = angular.module('consumers.services', []);


appServices.factory('$consumers',
function($http){
    var service = {};
    var api_base_address = "http://localhost:8000/";


    service.get = function(callback){
        $http.get(api_base_address + "api/consumers").
            success(function(data, status, headers, config) {
                callback(null, data);
            }).
            error(function(data, status, headers, config) {
                callback(data);
            });
    };

    service.changeAuthorized = function(consumer, callback){
        $http.post(api_base_address + "api/key/" + consumer.api_key + "/update_authorized", {authorized : consumer.authorized}).
            success(function(data, status, headers, config) {
                callback(null, data);
            }).
            error(function(data, status, headers, config) {
                callback(data);
            });
    };

    return service;
});