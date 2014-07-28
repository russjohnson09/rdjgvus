var payroll = angular.module('payroll', []);

payroll.controller('PayrollCtrl', function ($scope,$http) {
  var fin = Finance();
  
  $scope.refresh = refresh = function() {
      $http.get('./employees').success(function(data) {
        console.log(data);
        $scope.employees = data;
      });
      
      $http.get('./lists').success(function(data) {
        console.log(data);
        $scope.paytypes = data.paytypes;
        console.log($scope.paytypes);
      });
      
      $scope.paytypes = [1,2]
      
      $scope.finance = {
        gross: 10000,
        taxRate: 30, //percent
        checking: 100,
        savings: 200,
        four01k: 10000,
        house: 100000,
        insurance: {
            health: 200,
            car: 100,
        },
        net: function() {
            var self = this;
            return fin.net(self.gross,self.taxRate);
        }
      };
  }
  
  refresh();
  
  $scope.addEmployee = function() {
     var request = $http({
        method: "post",
        url: "./addemployee",
        data: {
            name: $scope.name,
            status: "Best Friend"
        }
    });
  }
  
  $scope.clearAll = function() {
     var request = $http({
        method: "post",
        url: "./clear",
    });
    request.success(function(data) {
        console.log(data);
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
