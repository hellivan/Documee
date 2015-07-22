var appServices = angular.module('consumers.services', ['DocumeeServices']);


appServices.factory('$consumers',
function($http, $documeeApi){
    var service = {};


    service.get = function(callback){
        $http.get($documeeApi.hostAddress + "api/consumers").
            success(function(data, status, headers, config) {
                callback(null, data);
            }).
            error(function(data, status, headers, config) {
                callback(data);
            });
    };

    service.changeAuthorized = function(consumer, callback){
        $http.post($documeeApi.hostAddress + "api/key/" + consumer.api_key + "/update_authorized", {authorized : consumer.authorized}).
            success(function(data, status, headers, config) {
                callback(null, data);
            }).
            error(function(data, status, headers, config) {
                callback(data);
            });
    };

    return service;
});