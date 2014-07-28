var payroll = angular.module('payroll', []);

payroll.controller('PayrollCtrl', function ($scope) {
  $scope.employees = [
    {name:'Greg',hourly:10,paytype:'Hourly'},
    {name:'Mark',hourly:40,paytype:'Salary'}
  ];
});
