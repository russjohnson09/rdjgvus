var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Create($scope,$http){
    var s = $scope;
    s.user = {};
    s.quiz = {
        author : '',
        title : '',
        questions : []
    };
    
    s.addQuestion = function() {
        s.quiz.questions.push({
            answer: '',
            title: '',
            responses: [{},{},{},{}]
        });
    };
    
    s.correct = function(q,r) {
        s.quiz.questions[q].answer = r;
    }
    
    s.submit = function() {
        s.quiz.active = true;
        var request = $http({
            method: "post",
            url: "./",
            data: {
                quiz: s.quiz
            }
        });
        
        request.success(function(id) {
            window.location.href = "../take?id=" + id;
        });
        
        request.error(function(data) {
            console.log("err"); console.log(data);
        });
    };
    
}
