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
        console.log(s.quiz);
        quiz.active = true;
    };
    
}
