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
      $scope.$watch('employees', function() {
        popTotals();
      });
  }
  
  function popTotals() {
    var result = {};
    var headers = [];
    var values = [];
    var employees = $scope.employees;
    var total = 0;
    for (var i=0;i<employees.length;i++) {
        var e = employees[i];
        var type = e.paytype || 'NA';
        var value = parseFloat(e.hourly) || 0;
        result[type] = result[type] || 0;
        result[type] += value;
        total += value;
    }
    
    for (var k in result) {
        headers.push(k);
        values.push(result[k]);
    }
    $scope.totals = result;
    $scope.totals.headers = headers;
    $scope.totals.values = values;
    $scope.totals.total = total;
  }
  
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
