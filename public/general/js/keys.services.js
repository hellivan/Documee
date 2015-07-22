var appServices = angular.module('KeysServices', ['DocumeeServices']);

appServices.factory('$keys',
    function($log, $http, $documeeApi){
        var service = {};

        service.requestKey = function (consumer, callback){
            var params = {
                email : consumer.email,
                company_name : consumer.company_name,
                project_name : consumer.project_name,
                project_description: consumer.project_description,
                project_url : consumer.project_url
            };

            $http.get($documeeApi.hostAddress + "api/key", {params: params}).
                success(function(data, status, headers, config) {
                    $log.debug("Success!" + status);
                    callback(null, data);
                }).
                error(function(data, status, headers, config) {
                    $log.debug("Failure!" + status);
                    callback(data);
                });
        };

        service.checkKey = function(api_key, callback){
            $http.get($documeeApi.hostAddress + "api/key/" + api_key +"/authorized").
                success(function(data, status, headers, config) {
                    callback(null, data);
                }).
                error(function(data, status, headers, config) {
                    callback(data);
                });
        };

        return service;
    });

