var app = angular.module('documee_api_access', ['ngRoute', 'ui.bootstrap', 'ui.router', 'registration']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider
            .when('/register', {
                templateUrl: 'registration/views/registration.html',
                controller: 'registration.MainController'
            })
            .when('/checkKey', {
                templateUrl: 'registration/views/check_key.html',
                controller: 'registration.MainController'
            })
            .otherwise({redirectTo: '/register'});
    }
]);




