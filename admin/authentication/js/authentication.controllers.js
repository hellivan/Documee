var appControllers = angular.module('authentication.controllers', ['authentication.services', 'ui.bootstrap']);

appControllers.controller("authentication.LoginController",
function ($scope, $rootScope, $location, AuthenticationService) {
    // reset login status
    AuthenticationService.clearCredentials();

    $scope.login = function(userName, password){
        $scope.dataLoading = true;
        AuthenticationService.login($scope.username, $scope.password, function(err, data) {
            if(err){return console.log(data)}

            $location.path('/');
            AuthenticationService.setCredentials();
        });
    };
    console.log("Loaded authentication.LoginController");
});

appControllers.controller("authentication.LoginBarController",
function ($scope, $rootScope, $location, AuthenticationService) {

    $scope.logout = function(){
        AuthenticationService.clearCredentials();
        $location.path('/');
    };
    console.log("Loaded authentication.LoginBarController");
});