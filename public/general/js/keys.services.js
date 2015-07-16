var appServices = angular.module('KeysServices', []);

appServices.factory('$keys',
    function($log, $http){
        var service = {};
        var api_base_address = "http://localhost:8000/";

        service.requestKey = function (consumer, callback){
            var params = {
                email : consumer.email,
                company_name : consumer.company_name,
                project_name : consumer.project_name,
                project_description: consumer.project_description,
                project_url : consumer.project_url
            };

            $http.get(api_base_address + "api/key", {params: params}).
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
            $http.get(api_base_address + "api/key/" + api_key +"/authorized").
                success(function(data, status, headers, config) {
                    callback(null, data);
                }).
                error(function(data, status, headers, config) {
                    callback(data);
                });
        };

        return service;
    });

