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
}
