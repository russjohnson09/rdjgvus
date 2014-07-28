var payroll = angular.module('payroll', []);

payroll.controller('PayrollCtrl', function ($scope,$http) {
  var fin = Finance();
  
  $scope.employees = [];
  
  var refresh = $scope.refresh = function() {
      $http.get('./employees').success(function(data) {
        console.log('employees');
        console.log(data);
        $scope.employees = data;
      });
      
      $http.get('./lists').success(function(data) {
        console.log(data);
        $scope.paytypes = data.paytypes;
        console.log($scope.paytypes);
      });
  }
  
  $scope.totals = function () {
    var hourly = 0;
    var salary = 0;
    var other = 0;
    var employees = $scope.employees;
    for (var i=0;i<employees.length;i++) {
        var e = employees[i];
        if (e.paytype == "Hourly") {
           hourly += (parseFloat(e.hourly) || 0); 
        } 
        else if (e.paytype == "Salary") {
            salary += (parseFloat(e.hourly) || 0); 
        }
        else {
            other += (parseFloat(e.hourly) || 0); 
        }
    }
    var result = {
    salary: salary,
    hourly: hourly,
    other: other,
    total: hourly + salary + other};
    console.log('totals');
    console.log(result);
    return result;
  };
  
  refresh();
  
  $scope.addEmployee = function() {
     var request = $http({
        method: "post",
        url: "./addemployee",
        data: {
            name: $scope.name,
            paytype: $scope.paytype,
            hourly: $scope.hourly
        }
    });
    request.success(function(data) {
        console.log(data);
        refresh();
    });
    request.error(function(data) {
        console.log(data);
    });
  }
  
  $scope.clearAll = function() {
     var request = $http({
        method: "post",
        url: "./clear",
    });
    request.success(function(data) {
        console.log(data);
        refresh();
    });
  }


  

});

Finance = function() {
    var self = {};
    
    self.net = function(gross,taxRate) {
        return gross * (1-taxRate);
    }
    
    return self;

};
