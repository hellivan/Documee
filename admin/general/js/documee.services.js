var appServices = angular.module('DocumeeServices', []);

appServices.provider('$documeeApi', function(){

    var apiHost;

    return {
        setHostAddress : function (host){
            apiHost = host;
        },

        $get : function(){
            return {
                hostAddress : apiHost
            };
        }
    };
});
