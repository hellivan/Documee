var appServices = angular.module('DocumeeServices', []);

appServices.provider('$documeeApi', function(){

    var apiPath;
    var apiHost;

    return {
        setHostAddress : function (host){
            apiHost = host;
        },

        setApiPath : function (path){
            apiPath = path;
        },

        $get : function(){
            return {
                baseAddress : apiHost + apiPath
            };
        }
    };
});
