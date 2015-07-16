var appControllers = angular.module('validation.controllers', ['validation.services', 'ui.bootstrap', 'KeysServices']);

appControllers.controller("validation.MainController",
function ($log, $scope, $location, $keys) {

    $scope.checkApiKey = function(){
        $keys.checkKey($scope.api_key, function(err, consumer){
            if(err){
                $scope.key_ok = false;
                $scope.key_error = err.message;
                $log.debug("An error occured:" + JSON.stringify(err));
            } else{
                $scope.key_ok  = true;
                $scope.key_error = false;
                $log.debug(consumer);
            }
        });
    };

    $log.debug("Loaded validation.MainController");
});

