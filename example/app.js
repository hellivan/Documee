var app = angular.module('documee_demo', ['angular-loading-bar', 'ui.bootstrap', 'ui.router', 'apitest']);

app.config(['cfpLoadingBarProvider', '$httpProvider', function(cfpLoadingBarProvider, $httpProvider) {
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
  }]);




