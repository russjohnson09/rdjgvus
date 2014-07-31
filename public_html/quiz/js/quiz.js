var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope,$http){

    function refresh() {
        var request = $http({
            method: "get",
            url: "./quiz_list"
        });
        request.success(function(data) {
            s.quizes = data.quizAry;
            s.isLoading = false;
        });
        
        request.error(function(data) {
            s.isLoading = false;
        });
    }

    var s = $scope;
    s.isLoading = true;
    s.takingQuiz = false;
    s.user = {};
    s.user.responses = [];
    s.quizes = [];
    s.testData = [];
    
    refresh();
    
    s.take = function(q) {
        console.log(q);
        s.quiz = q;
        s.takingQuiz = true;
    }
    
    s.submit = function() {
        s.takingQuiz = false;
    }
    
    s.removeBlank = function() {
        var request = $http({
            method: "post",
            url: "./removeBlank"
        });
        
        request.success(function(data) {
            refresh();
        });
    }
    
    s.response = function(q,r) {
        console.log(q);
    };
}
