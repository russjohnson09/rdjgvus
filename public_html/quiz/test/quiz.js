var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope,$http){
    var s = $scope;
    s.user = {};
    s.user.responses = [];
    s.quiz = {};
    s.testData = [];
    
    $http.get('./userdata').success(function(data) {
        console.log(data);
        s.user.data = data;
    });
    
    s.testQuiz = {
        id: 3,
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
                title: 'What is the capital of Michigan?',
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
            s.isLocked = true;
            s.responses = data['user_submissions'];
            s.setData(s.responses);
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
            var unanswered = (responses[i] === undefined || (!responses[i] && (responses[i] !== 0))); //undefined or blank or null
            if (unanswered) {
                blankCount += 1;
            }
            else {
                if (responses[i] == answer) {
                    correctCount += 1;
                }
            }
            responses[i];
        }
        s.user.unanswered = blankCount;
        return correctCount;
    }
    
    s.generate = function(){};
    
    s.isCorrect = function(question,response) {
        return s.quiz.questions[question].opts.answer == response;
    };
    
    s.isResponseCorrect = function(question) {
        var responses = s.user.responses;
        if (responses[question] === undefined || (!responses[question] && (responses[question] !== 0))) {
            return false;
        }
        else {
            return s.quiz.questions[question].opts.answer == responses[question];
        }
    };
    
    s.isSelected = function(question,response) {
        var responses = s.user.responses;
        if (responses[question] === undefined || (!responses[question] && (responses[question] !== 0))) {
            return false;
        }
        return response == responses[question];
    }
    
    s.setData = function(submissions) {
        s.testData = [];
        var questions = s.quiz.questions;
        for (var i in questions) {
            var q = questions[i];
            s.testData[i] = [{
                key: "chart" + i,
                values: []
            }];
            var values = s.testData[i][0].values;
            var responses = q.responses;
            for (var j in responses) {
                values.push([j,0]);
            }
        }
        for (var i in submissions) {
            var submission = submissions[i];
            console.log(submission);
            var responses = submission.responses;
            for (var j in responses) {
                s.testData[j][0].values[responses[j]][1] += 1;
            }
        }
        
        console.log(s.testData);
    }
    
    s.xFunction = function() {
        return function(d) {
            return d[0];
        };
    }
    
    s.yFunction = function() {
        return function(d) {
            return d[1];
        };
    }
    

    
}
