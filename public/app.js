var app = angular.module('documee_api_access', ['ui.bootstrap', 'ui.router']);

app.controller("mainController", function($http, $scope){
    var api_base_address = "http://localhost:8000/"


    $scope.check_api_key = function(){
        $http.get(api_base_address + "api/key/" + $scope.api_key +"/authorized").
            success(function(data, status, headers, config) {
                console.log(data);
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            });

    };

    $scope.request_api_key = function(){
        var params = {
            email : $scope.email,
            company_name : $scope.company_name,
            project_name : $scope.project_name,
            project_description: $scope.project_description,
            project_url : $scope.project_url
        };

        $http.get(api_base_address + "api/key", {params: params}).
           success(function(data, status, headers, config) {
               console.log(data);
           }).
           error(function(data, status, headers, config) {
               console.log("Error: " + data);
           });
   };
});


