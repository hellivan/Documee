var appControllers = angular.module('registration.controllers', ['registration.services', 'ui.bootstrap']);

appControllers.controller("registration.MainController",
function ($scope, $location, $keys) {

    $scope.state = undefined

    $scope.requestApiKey = function(){
        $keys.requestKey($scope.email, $scope.company_name, $scope.project_name, $scope.project_description, $scope.project_url, function(err, data){
            if(err){ return console.log(err)};
            console.log(data);
        });
    };
});

appControllers.controller("authentication.LoginBarController",
function ($scope, $rootScope, $location, AuthenticationService) {

    $scope.logout = function(){
        AuthenticationService.clearCredentials();
        $location.path('/');
    };
    console.log("Loaded authentication.LoginBarController");
});