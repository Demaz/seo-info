var app1 = angular.module('main', ['ngRoute','ngTable','ngResource']).config(function($routeProvider, $locationProvider, $httpProvider) {
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('http://localhost:8888/loggedin').success(function(logged){
        // Authenticated
    	  alert(logged);
        if (logged == true)
          $timeout(deferred.resolve, 0);

        // Not Authenticated
        else {
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
          window.location  ='/login.html';
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            return response;
          }, 
          // Error: check the error status to get only the 401
          function(response) {
            if (response.status === 401)
              $location.url('/login.html');
            return $q.reject(response);
          }
        );
      }
    });
    //================================================

    //================================================
    // Define all the routes
    //================================================
    $routeProvider.
 	when('/projet', {
     	templateUrl: 'partials/projet-liste.html',
     	controller: 'compte',
     	resolve: {
     	          loggedin: checkLoggedin
     	        }
     	}).
    when('/liste-url', {
         	templateUrl: 'partials/projet-uri.html',
         	controller: 'projet'
         	}).
 	when('/create-projet', {
 	templateUrl: 'partials/projet-info.html',
 	controller: 'projet'
 	}).
 	when('/login', {
     	templateUrl: 'login.html',
     	controller: 'login'
     	}).
 	otherwise({
 		redirectTo: '/projet'
 		});
    //================================================

  }) // end of config()
  .run(function($rootScope, $http){
    $rootScope.message = '';

    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      $http.post('/logout');
    };
  });



/*
app1.config(['$routeProvider',
         	function($routeProvider) {
         	$routeProvider.
         	when('/projet', {
             	templateUrl: 'partials/projet-liste.html',
             	controller: 'compte',
             	resolve: {
             	          loggedin: checkLoggedin
             	        }
             	}).
            when('/liste-url', {
                 	templateUrl: 'partials/projet-uri.html',
                 	controller: 'projet'
                 	}).
         	when('/create-projet', {
         	templateUrl: 'partials/projet-info.html',
         	controller: 'projet'
         	}).
         	when('/login', {
             	templateUrl: 'login.html',
             	controller: 'login'
             	}).
         	otherwise({
         		redirectTo: '/projet'
         		});
         }]);*/

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

app1.controller('login', function($http,$scope) {
	var app1 = this;
    app1.setUser = function(user) { 
	$http({
            method : 'POST',
            url : 'http://localhost:8888/login',
            data : user
        }).success(function(data, status, headers, config) {
        		
	        	if(data == 'true') {
	        		app1.logSuccess();
	        	} else {
	        		app1.logFail();
	        	}
        	}).error(function(data, status, headers, config) {
        		alert('error')
        	});   
    }
    
    $http.get("http://localhost:8888/loggedin")
    .success(function(data) {
		$scope.users = data;
    })
    
    app1.logFail = function() { 
       	alert('log fail')
    }
    
    app1.logSuccess = function() { 
    	alert('log succes');
    	//window.location  = '/projet.html';
    }
    
    
})





