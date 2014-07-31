var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope,$http){
    var s = $scope;
    s.isLoading = true;
    s.user = {};
    s.user.responses = [];
    s.quizes = [];
    s.testData = [];
    
    var request = $http({
        method: "get",
        url: "./quiz_list"
    });
    
    request.success(function(data) {
        s.quizes = data.quizAry;
        console.log(s.quizes);
        s.isLoading = false;
    });
    
    request.error(function(data) {
        s.isLoading = false;
    });
}
