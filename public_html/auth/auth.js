var app = angular.module("auth", ['nvd3ChartDirectives']);

function Auth($scope,$http){
    var s = $scope;
    
    var refresh = s.refresh = function() {
        var request = $http({
            method: "get",
            url: "/user"
        });
        request.success(function(data) {
            s.user = data;
        });
        
        request.error(function(data) {
            s.user = 'err';
        });
    
    };
    
    refresh();
    
}
