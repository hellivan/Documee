var app = angular.module('documee_admin', ['ui.bootstrap', 'ui.router', 'ngRoute', 'angularMoment', 'authentication', 'consumers']);


app.config(['$routeProvider', '$httpProvider',
    function($routeProvider, $httpProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'authentication/views/login.html',
                controller: 'authentication.LoginController'
            })
            .when('/consumers', {
                templateUrl: 'consumers/views/consumers-table.html',
                controller: 'consumers.MainController'
            })
            .otherwise({ redirectTo: '/consumers' });

        $httpProvider.defaults.withCredentials = true;
    }
]);


app.run(
    function ($rootScope, $location, $cookieStore, $http, AuthenticationService) {
        // keep user logged in after page refresh
        //AuthenticationService.restoreCredentials();

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && (!$rootScope.globals || !$rootScope.globals.logged_in)) {
                $location.path('/login');
            }
        });
    });
