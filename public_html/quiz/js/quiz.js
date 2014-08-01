var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope,$http){
    var s = $scope;
    init();
    
    function init() {
    
    
    }

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
    s.quiz = {};  //currently selected quiz (editing,taking,viewing results for, etc.)
    s.data = [];
    s.view = 'mainView';  //one of mainView,resultsView,submissionView,takeQuizView,editQuizView
    
    //mainView
        
    s.mainViewInit = function(){
        s.view = "mainView";
       refresh();
    }
    
    s.viewResults = function(q) {
        s.data = [];
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
    
    //create/edit quiz
    s.editQuizViewInit = function(q) {
        s.quiz = q;
        s.view = 'editQuizView';
    };
    
    refresh();
    
    
    //takeQuizView
    s.takeQuizViewInit = function(q) {
        console.log(q);
        s.quiz = q;
        s.view = 'takeQuizView';
        $("#takeQuizView input").prop("checked",false);
    }
    
    s.submit = function() {
        var request = $http({
            method: "post",
            url: "./",
            data: {quiz:s.quiz,
                name:s.name,
                responses:s.responses
            }
        });
        request.success(function(data) {
            console.log(data);
            s.mainViewInit();
        });
    }
    
    s.response = function(q,r) {
        s.responses[q] = r;
    };
    
    s.subTotals = function() {
        var subs = s.submissions;
        var quiz = s.quiz;
        var questions = quiz.questions;
        if (!s.viewingResults || s.loadingResults) return;
        if (s.data.length > 0) return;
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
    
    s.xFunction = function() {
        return function(d) {
            return d[0];
        };
    }
    
    s.yFunction = function() {
        return function(d) {
            return d[1];
        };
    };
    
    var format = d3.format(',.0f');
    $scope.valueFormatFunction = function(){
	    return function(d){
        	return format(d);
        };
    };
}
