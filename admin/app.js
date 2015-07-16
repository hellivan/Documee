var app = angular.module('documee_admin', ['ngCookies', 'ui.bootstrap', 'ui.router', 'ngRoute', 'angularMoment', 'authentication', 'consumers']);


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
            .otherwise({redirectTo: '/consumers'});

        $httpProvider.defaults.withCredentials = true;

        $httpProvider.interceptors.push(function ($q, $location) {
            return {
                'response': function (response) {
                    //if (response.status === 401) {
                    //    console.log("Response 401");
                    //}
                    return response || $q.when(response);
                },
                'responseError': function (rejection) {
                    if (rejection.status === 401) {
                        $location.path('/login').search('returnTo', $location.path());
                    }
                    return $q.reject(rejection);
                }
            };
        });
    }
]);


app.run(
    function ($log, $rootScope, $location, $cookies, $http, AuthenticationService) {
        // keep user logged in after page refresh
        //AuthenticationService.restoreCredentials();
        $log.debug("Stored cookies are: " + JSON.stringify($cookies.getAll()));
        if($cookies.get('connect.sid')){
            if(!$rootScope.globals){$rootScope.globals = {};}
            $rootScope.globals.logged_in=true;
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {

            // redirect to login page if not logged in
            if ($location.path() !== '/login' && (!$rootScope.globals || !$rootScope.globals.logged_in)) {
                $location.path('/login');
            }
        });
    });
