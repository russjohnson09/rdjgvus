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
    
    function refreshSubmissionCount() {
        var request = $http({
            method: "get",
            url: "./sub_count?" + "qid",
        });
        request.success(function(data) {
            s.quizes = data.quizAry;
            s.isLoading = false;
        });
        request.error(function(data) {
            s.isLoading = false;
        });
    }
    
    function loadSubmissions() {
        var request = $http({
            method: "get",
            url: "./submissions?quiz_id=" + s.quiz._id
        });
        request.success(function(data) {
            console.log(data);
            s.submissions = data.submissionsAry;
            s.loadingResults = false;
        });
    }

    var s = $scope;
    s.isLoading = true;
    s.takingQuiz = false;
    s.quizes = [];
    s.responses = [];
    s.viewingResults = false;
    s.averageScore = '';
    s.quiz = {};
    //s.
    
    refresh();
    
    s.take = function(q) {
        console.log(q);
        s.quiz = q;
        s.takingQuiz = true;
    }
    
    s.submit = function() {
        s.takingQuiz = false;
        
        var request = $http({
            method: "post",
            url: "./",
            data: {quiz:s.quiz,
                name:s.name,
                responses:s.responses
            }
        });
        
        request.success(function(data) {
            //refreshSubmissionCount()
        });
        
        request.error(function(data) {
            //s.isLoading = false;
        });
    }
    
    s.viewResults = function(q) {
        s.viewingResults = true;
        s.loadingResults = true;
        s.quiz = q;
        loadSubmissions();
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
        s.responses[q] = r;
    };
    
    s.subTotals = function() {
        var subs = s.submissions;
        var quiz = s.quiz;
        if (!s.viewingResults || s.loadingResults) return;
        var questions = quiz.questions;
        var totalPoints = 0;
        var data = [];
        var questions = s.quiz.questions;
        for (var i in questions) {
            var q = questions[i];
            data[i] = [{
                key: "chart" + i,
                values: []
            }];
            var values = data[i][0].values;
            var responses = q.responses;
            for (var j in responses) {
                values.push([j,0]);
            }
        }
        for (var i in subs) {
            var submission = subs[i];
            var responses = submission.responses;
            for (var j in responses) {
                data[j][0].values[responses[j]][1] += 1;
                var q = questions[j];
                var answer = q.answer;
                if (responses[i] == answer) {
                    totalPoints += 1;
                }
            }
        }
        console.log(data);
        s.data = data;
        
        var totalQuestions = questions.length;
        var totalSubmissions = subs.length;
        if (totalSubmissions > 0 && totalQuestions > 0) {
            s.averageScore = totalPoints / (totalSubmissions * totalQuestions);
        }
        return totalSubmissions;
    };
    
    s.return = function() {
        s.viewingResults = false;
    }
        /*
        for (var i in subs) {
            var sub = subs[i];
            var responses = sub.responses;
            for 
                s.totals[j] += responses[]j]
        }
        
        for (var i in questions) {
            var q = questions[i];
            var answer = q.opts.answer;
            var unanswered = (responses[i] === undefined || (!responses[i] && (responses[i] !== 0)));
            if (responses[i] == answer) {
                totalPoints += 1;
            }
            responses[i];
        }
        
        if (totalSubmissions > 0 && totalQuestions > 0) {
            s.averageScore = totalPoints / (totalSubmissions * totalQuestions)
        }
        */
}
