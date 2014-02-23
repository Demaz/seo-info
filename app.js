var app1 = angular.module('main', ['ngTable']);

app1.controller('compte', function($http,$scope) {
	ctrl = this;
   $http.get("http://localhost:8888/users")
      .success(function(data) {
		$scope.users = data;
      })
})


app1.controller('projet', function($http,$scope) {
	var app1 = this;
    app1.setInfos = function(infosProjet) { 
	$http({
            method : 'POST',
            url : 'http://localhost:8888/createProject',
            data : infosProjet
        })
	   
    }

})


app1.controller('liste', function($http,$scope) {
	ctrl = this;
   $http.get("http://localhost:8888/liste")
      .success(function(data) {
		$scope.users = data;
      })
})



