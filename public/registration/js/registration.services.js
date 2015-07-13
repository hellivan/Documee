var appServices = angular.module('registration.services', []);

appServices.factory('$keys',
function($http){
    var service = {};
    var api_base_address = "http://localhost:8000/";

    service.requestKey = function (email, company_name, project_name, project_description, project_url, callback){
        var params = {
            email : email,
            company_name : company_name,
            project_name : project_name,
            project_description: project_description,
            project_url : project_url
        };

        $http.get(api_base_address + "api/key", {params: params}).
            success(function(data, status, headers, config) {
                callback(null, data);
            }).
            error(function(data, status, headers, config) {
                callback(data);
            });
    };

    service.checkKey = function(api_key){
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

