var app = angular.module("quiz", ['nvd3ChartDirectives']);

function Quiz($scope){
    var s = $scope;
    s.responses = [{text:"1"},{text:"2"}];
    
    s.quiz = {
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
                title: 'What is the captiol of Michigan?',
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
    
    s.response = {};
    
    
    s.submit = function() {
            
    }
    
    
}
