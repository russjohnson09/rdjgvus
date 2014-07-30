var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope,$http){
    var s = $scope;
    s.user = {};
    s.user.responses = [];
    
    $http.get('./userdata').success(function(data) {
        console.log(data);
        s.user.data = data;
    });
    
    //s.test = "hello";
    
    s.quiz = {
        title: 'Test Quiz',
        questions: [
            {
                title: 'What is 1+1?',
                opts: {answer:2,type:'multiple'},
                responses: [
                    {title:'0'},
                    {title:'1'},
                    {title:'2'},
                    {title:'3'}
                ]
            },
            {
                title: 'What is the captiol of Michigan?',
                opts: {answer:1,type:'multiple'},
                responses: [
                    {title:'Detroit'},
                    {title:'Lansing'},
                    {title:'Grand Rapids'},
                    {title:'Yes'}
                ]
            },
        ]
    };
    
    s.response = {};
    
    
    s.submit = function() {
            
    }
    
    s.toggleSelection = function(response) {
        console.log(response);
    };
    
    s.toggleSelection = function(question,response) {
        s.user.responses[question] = response;
        //console.log($index);
    };
    
    s.correct = function() {
        var responses = s.user.responses;
        var questions = s.quiz.questions;
        var blankCount = 0;
        var correctCount = 0;
        for (var i in questions) {
            var q = questions[i];
            var answer = q.opts.answer;
            var unanswered = (responses[i] === undefined || responses[i] === '');
            if (unanswered) {
                blankCount += 1;
            }
            else {
                if (responses[i] == answer) {
                    correctCount += 1;
                }
            }
            
            console.log(responses[i]);
            responses[i];
        }
        s.user.unanswered = blankCount;
        return correctCount;
    }
    
}
