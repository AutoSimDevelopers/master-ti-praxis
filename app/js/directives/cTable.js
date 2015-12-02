angular
  .module('myApp')
  .directive('cTable', cTable);

console.log('dir');

function cTable(){
  return {
    restrict: 'A',
    scope: {
      automaton: '=automaton'
    },
    link: function($scope){

      function build(){
        // Get all possible chars once in an array
        $scope.chars = _.uniq(_.reduce($scope.automaton.config.transitions, function(res, c){
          res.push(c[1]);
          return res;
        }, []));

        // 
        $scope.transitions = _.reduce($scope.automaton.config.transitions, function(res, t){
           if (res[t[0]] == undefined){
             res[t[0]]= {
               folowing: _.map(new Array($scope.chars.length), function(){return ''}),
               class: 'active'
             }
           } 
           res[t[0]].folowing[_.indexOf($scope.chars, t[1])] = t[2];
           return res;
        }, {});
      }

      build();
      
      $scope.$watch('automaton.statusSequence', function(seq){
        var status = 'info';
        if($scope.automaton.status == 'accepted'){
          status = 'success';
        }
        else if($scope.automaton.status == 'not accepted'){
          status = 'warning';
        }
        _.forEach($scope.transitions, function(transition){transition.class = 'active'})
        $scope.transitions[_.last(seq)].class = status;
      }, true);
    },
    templateUrl: 'template/cTable.html'
  };
}

