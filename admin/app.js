var app = angular.module('documee_admin', ['ui.bootstrap', 'ui.router', 'angularMoment']);

app.controller("mainController", function($http, $scope){
    var api_base_address = "http://localhost:8000/"


    $scope.get_consumers = function(){
        $http.get(api_base_address + "api/consumers").
           success(function(data, status, headers, config) {
               console.log(data);
               $scope.consumers = data;
           }).
           error(function(data, status, headers, config) {
               console.log("Error: " + data);
           });
   };

    $scope.changeAuthorized = function(consumer){
        $http.post(api_base_address + "api/key/" + consumer.api_key + "/update_authorized", {authorized : consumer.authorized}).
            success(function(data, status, headers, config) {
                console.log(data);
                consumer.authorized = data.authorized;
            }).
            error(function(data, status, headers, config) {
                console.log("Error: " + data);
            });

    };

    $scope.get_consumers();
});


