var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope,$http){
    var s = $scope;
    s.user = {};
    s.user.responses = [];
    s.quiz = {};
    
    $http.get('./userdata').success(function(data) {
        console.log(data);
        s.user.data = data;
    });
    
    s.testQuiz = {
        id: 1,
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
                title: 'What is the capitol of Michigan?',
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
    
    
    //test quiz creation
    (function(s) {
        console.log(s);
         var request = $http({
            method: "post",
            url: "./testquiz",
            data: {
                quiz : s.testQuiz 
            }
        });
        request.success(function(data) {
            console.log(data);
            s.quiz = data;
        });
        request.error(function(data) {
            console.log(data);
        });
    })(s);
    
    s.response = {};
    
    s.submit = function() {
         var request = $http({
            method: "post",
            url: "./submit",
            data: {
                user_id: s.user.data.ip,
                responses : s.user.responses,
                quiz_id: s.quiz._id
            }
        });
        request.success(function(data) {
            console.log(data);
        });
        request.error(function(data) {
            console.log(data);
        });
    }
    
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
            var unanswered = (responses[i] === undefined || !responses[i]); //undefined or blank or null
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
    
    s.generate = function(){};
    
}
