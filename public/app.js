var app = angular.module('documee_api_access', ['ngRoute', 'ui.bootstrap', 'ui.router', 'registration', 'validation', 'DocumeeServices']);

app.config(['$routeProvider', '$documeeApiProvider',
    function($routeProvider, $documeeApiProvider) {
        $routeProvider
            .when('/register', {
                templateUrl: 'registration/views/registration.html',
                controller: 'registration.MainController'
            })
            .when('/checkKey', {
                templateUrl: 'validation/views/check_key.html',
                controller: 'validation.MainController'
            })
            .otherwise({redirectTo: '/register'});

        $documeeApiProvider.setHostAddress("http://localhost:8000/");
    }]);




