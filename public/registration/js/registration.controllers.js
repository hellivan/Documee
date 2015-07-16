var appControllers = angular.module('registration.controllers', ['KeysServices', 'ui.bootstrap', 'ui.router']);

appControllers.controller("registration.MainController",
    function ($log, $scope, $location, $keys) {


        $scope.state = undefined;
        $scope.consumer = {};

        $scope.requestApiKey = function(){
            $keys.requestKey( $scope.consumer, function(err, consumer){
                if(err){
                    $log.debug("An error occured:" + JSON.stringify(err));
                    $scope.error = err;
                    $scope.state = 'error';
                } else {
                    $log.debug(consumer);
                    $scope.consumer = consumer;
                    $scope.state = 'success';
                }
            });
        };

        $scope.back = function(){
          delete $scope.state;
        };

        $log.debug("Loaded MainController");
    });


