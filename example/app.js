var app = angular.module('documee_demo', ['angular-loading-bar', 'ui.bootstrap', 'ui.router', 'apitest', 'ngRoute', 'LocalStorageModule']);

app.config(['cfpLoadingBarProvider', '$httpProvider', '$routeProvider', 'localStorageServiceProvider', function(cfpLoadingBarProvider, $httpProvider, $routeProvider, localStorageServiceProvider) {
    $routeProvider
        .when('/base', {
            templateUrl: 'apitest/views/api-test-base.html',
            controller: 'apitest.BaseController'
        })
        .when('/mix', {
            templateUrl: 'apitest/views/api-test-mix.html',
            controller: 'apitest.MixController'
        })
        .otherwise({redirectTo: '/base'});


    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = true;

    $httpProvider.interceptors.push(function ($q, $rootScope) {
        return {
            'response': function (response) {
                return response || $q.when(response);
            },
            'responseError': function (rejection) {
                console.log("Injected error method");
                console.log(rejection);
                return $q.reject(rejection);
            }
        };
    });

    localStorageServiceProvider.setPrefix('ls');
  }]);


app.run(
    function ($log, $rootScope, $location, $cookies, $authentication) {
        $authentication.restoreCredentials();
    });



