var app = angular.module("quiz", ['nvd3ChartDirectives']).config(
['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|data):/);
}

]);

function Quiz($scope,$http){
    var s = $scope;
    
    var getUser = s.getUser = function() {
        var request = $http({
            method: "get",
            url: "/user"
        });
        request.success(function(data) {
            console.log(data);
            s.user = data;
        });
    }
    
    //refresh/load related functions
    s.refreshList = refreshList = function() {
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

    //mainView
    s.mainViewInit = mainViewInit = function(){
        s.view = "mainView";
        refreshList();
    }
    
    s.removeBlank = function() {
        var request = $http({
            method: "post",
            url: "./removeBlank"
        });
        
        request.success(function(data) {
            refreshList();
        });
    }
    
    s.removeAll = function() {
        var request = $http({
            method: "post",
            url: "./removeAll"
        });
        
        request.success(function(data) {
            refreshList();
        });
    };
    
    s.exportQuiz = exportQuiz = function(q) {
        s.export = 'data:application/json;' + JSON.stringify(q);
    }
    
    //create/edit quiz
    s.editQuizViewInit = editQuizViewInit = function(q) {
        if (typeof q === "undefined") {
            s.isEditing = false;
            q = {author:'',title:'',questions:[]};
        }
        else {
            s.isEditing = true;
        }
        s.quiz = q;
        s.view = 'editQuizView';
    };
    
    s.addQuestion = function() {
        s.quiz.questions.push({
            answer: '',
            title: '',
            responses: [{},{},{},{}]
        });
    };
    
    s.submitQuiz = function() {
        s.quiz.active = true;
        var request = $http({
            method: "post",
            url: "./create",
            data: {
                quiz: s.quiz
            }
        });
        
        request.success(function(data) {
            console.log("updated");
            console.log(data);
            mainViewInit();
        });
        
        request.error(function(data) {
            console.log("err"); console.log(data);
        });
    };
    
    
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
    
    s.saveResponse = function(q,r) {
        s.responses[q] = r;
    };
    
    //resultsView
    s.resultsViewInit = function(q) {
        s.quiz = q;
        console.log(q);
        loadSubmissions(q._id);
        s.view = 'resultsView';
    }
    
    s.loadSubmissions = loadSubmissions = function(_id) {
        var request = $http({
            method: "get",
            url: "./submissions?quiz_id=" + _id
        });
        request.success(function(data) {
            console.log(data);
            s.submissions = data.submissionsAry;
            getSubmissionTotals();
        });
    }

    s.getSubmissionTotals = getSubmissionTotals = function() {
        var subs = s.submissions;
        var quiz = s.quiz;
        var questions = quiz.questions;
        
        if (s.data.length > 0) return;
        var totalPoints = 0;
        var questions = s.quiz.questions;

        s.data = getDataArray(subs,questions);
        
        var totalQuestions = questions.length;
        var totalSubmissions = subs.length;
        if (totalSubmissions > 0 && totalQuestions > 0) {
            s.averageScore = s.totalPoints / (totalSubmissions * totalQuestions);
        }
    };

    //data-related functions
    s.valueFormatFunction = function(){
	    return function(d){
        	return s.labelFormat(d);
        };
    };
    
    
    //populate data from submissions
    //submissions = [sub1,sub2,...]
    //sub = {_id,name,quiz_id,responses}
    //responses = [[2,'',1],..] where the index of a response is the question number
    //data[questionNumber][0] = {values: [[responseCount]]}
    //data is an array with a single object, this object has a single key 'values'
    // /*http://stackoverflow.com/questions/21242620/displaying-a-single-series-multi-bar-chart-using-nvd3-library
    function getDataArray(subs,questions) {
        var values = [];
        s.totalPoints = 0;
        var questions = s.quiz.questions;
        
        data = initDataArray(questions);
        //console.log(data);
        
        for (var i in subs) {
            var submission = subs[i];
            var responses = submission.responses;
            //console.log(responses);
            for (var j in responses) {
                var response = parseInt(responses[j]);
                if (isNaN(response)) {
                    break;
                }
                //console.log(j);
                if (typeof data[j] === "undefined") {
                    console.log("invalid submission");
                    console.log(j);
                    console.log(response);
                    console.log(responses);
                    break;
                }
                var values = data[j][0].values;
                
                values[response][1] += 1;

                var q = questions[j];
                var answer = q.answer;
                if (response == answer) {
                    s.totalPoints += 1;
                }
            }
        }
        
        return data;
        
    }
    
    function initDataArray(questions) {
        var data = [];
        for (var i in questions) {
            var q = questions[i];
            var values = [];
            data[i] = [{values: values}];
            var responses = q.responses;
            for (var j in responses) {
                var response = responses[j];
                values.push([response.text,0])
            }
        }
        return data;
    }
    
    
    //initialize data
    (function(){
        refreshList();
        getUser();
        s.isLoading = true;
        s.takingQuiz = false;
        s.quizes = [];
        s.responses = [];
        s.viewingResults = false;
        s.averageScore = '';
        s.quiz = {};  //currently selected quiz (editing,taking,viewing results for, etc.)
        s.data = [];
        s.view = 'mainView';  //one of mainView,resultsView,submissionView,takeQuizView,editQuizView
        s.labelFormat = d3.format(',.0f');  //requires d3
    }());
}
