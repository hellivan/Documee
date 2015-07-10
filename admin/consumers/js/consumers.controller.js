var appControllers = angular.module('consumers.controllers', ['consumers.services', 'ui.bootstrap']);


appControllers.controller("consumers.MainController", function ($scope, $consumers){


    function update(){
        $consumers.get(function(err, consumers){
           if(err) {throw err;}
            $scope.consumers = consumers;
        });
    };

    $scope.changeAuthorized = function (consumer){
        $consumers.changeAuthorized(consumer, function(err, res_consumer){
            if(err) { throw err; }
            consumer.authorized = res_consumer.authorized;
        });
    };

    update();
});