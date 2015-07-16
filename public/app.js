var app = angular.module('documee_api_access', ['ngRoute', 'ui.bootstrap', 'ui.router', 'registration', 'validation']);

app.config(['$routeProvider',
    function($routeProvider) {
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
    }
]);




