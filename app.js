var app1 = angular.module('main', ['ngRoute','ngTable','ngResource','xeditable']).config(function($routeProvider, $locationProvider, $httpProvider) {
    //================================================
    // Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('http://localhost/loginService/isSigned').success(function(logged){
        // Authenticated
          if (logged == 'true')
              $timeout(deferred.resolve, 0);

            // Not Authenticated
            else {
              $rootScope.message = 'You need to log in.';
              $timeout(function(){deferred.reject();}, 0);
              $location.url('/login');
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
 	when('/projets', {
     	templateUrl: 'partials/projets.html',
     	controller: 'projets',
     	resolve: {
     	          loggedin: checkLoggedin
     	        }
     	}).
   when('/listes/:projetUid', {
     	templateUrl: 'partials/listes.html',
     	controller: 'listes',
     	resolve: {
     	          loggedin: checkLoggedin
     	        }
     	}).
    when('/users/:projetUid', {
         	templateUrl: 'partials/users.html',
         	controller: 'user',
         	resolve: {
         	          loggedin: checkLoggedin
         	        }
         	}).
    when('/liste-detail/:projetUid/:projetListUrlUid', {
         	templateUrl: 'partials/liste-detail.html',
         	controller: 'listeDetail',
         	resolve: {
   	          loggedin: checkLoggedin
   	        }
         	}).
 	when('/projet-detail/:projetUid', {
 	templateUrl: 'partials/projet-detail.html',
 	controller: 'projetDetail',
 	resolve: {
         loggedin: checkLoggedin
       }
 	}).
 	when('/create-projet', {
 	 	templateUrl: 'partials/projet-detail.html',
 	 	controller: 'projetDetail',
 	 	resolve: {
 	         loggedin: checkLoggedin
 	       }
 	 	}).
 	when('/list-add/:projetUid', {
 		templateUrl: 'partials/liste-ajout.html',
     	controller: 'listeAdd',
 	 	 	resolve: {
 	 	         loggedin: checkLoggedin
 	 	       }
 	 	 	}).
 	when('/parameters/:projetListUrlUid', {
 	 	 		templateUrl: 'partials/parameters.html',
 	 	     	controller: 'parameters',
 	 	 	 	 	resolve: {
 	 	 	 	         loggedin: checkLoggedin
 	 	 	 	       }
 	 	 	}).
    when('/login/signeOut', {
    	    templateUrl: 'login.html',
         	controller: 'loginOut'
         	}).
    when('/login', {
 	 	     	templateUrl: 'login.html',
 	 	     	controller: 'login'
 	 	    }).
 	otherwise({
 		redirectTo: '/projets'
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

app1.controller('listes', function($http,$scope,$routeParams) {
	$scope.projetUid = $routeParams.projetUid;
	ctrl = this;
	$http({
        method : 'POST',
        url : 'http://localhost/projetService/listes',
        data : 'projetUid='+$routeParams.projetUid,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
    	$scope.listes = data;
    })
	
})

app1.controller('user', function($http,$scope,$routeParams) {
	$scope.projetUid = $routeParams.projetUid;
	ctrl = this;
	$http({
        method : 'POST',
        url : 'http://localhost/projetService/users',
        data : 'projetUid='+$routeParams.projetUid,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
    	$scope.users = data;
    })
	
})

app1.controller('parameters', function($http,$scope) {
	$scope.userAgents = [{name : "iphone5s", ua: "iphone mozilla" },{name : "anroid5", ua: "android mozilla" }];
	$scope.frequences = [{name : "dés que possible"},{name : "tous les jours"}];
	$scope.uaDefault = $scope.userAgents[0];
})


app1.controller('projets', function($http,$scope) {
	ctrl = this;
   $http.get("http://localhost/projetService/projets")
      .success(function(data) {
		$scope.projets = data;
      })
})

app1.run(function(editableOptions) {
    	  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    	});



app1.controller('projetDetail', function($http,$scope,$routeParams) {
	$scope.projetUid = $routeParams.projetUid;
    $scope.app.setInfos = function(infosProjet) { 
	$http({
            method : 'POST',
            url : 'http://localhost/projetService/add',
            data : infosProjet
        })
    }
    
	if($routeParams.projetUid != '') {
		$http({
            method : 'POST',
            url : 'http://localhost/projetService/get',
            data : 'projetUid='+$routeParams.projetUid,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data, status, headers, config) {
        	$scope.app.infosProjet = data;
        })
    }
})

app1.controller('listeAdd', function($http,$scope,$routeParams,$location) {
	$scope.projetUid = $routeParams.projetUid;
	$scope.modes = [{name: 'oneshot'},{name: 'planifié'}]; 
	$scope.modeDefault = $scope.modes[1];
	
	$scope.app.saveInfos = function(urlList) { 
		urlList.projetUid = $scope.projetUid;
		$http({
	            method : 'POST',
	            url : 'http://localhost/projetService/addUrllist',
	            data : urlList
	        }).success(function(data, status, headers, config) {
	        	alert(data.uid);
	        	$location.path("/liste-detail/"+$scope.projetUid+"/"+data.uid);
		    })
	    }
	    

})


app1.controller('listeDetail', function($http,$scope,$routeParams) {
	
	$scope.projetUid = $routeParams.projetUid;
	$scope.projetListUrlUid = $routeParams.projetListUrlUid;
	$scope.app.urlList = {};
	$scope.urlListe = {};
	
	if(!angular.isUndefined($routeParams.projetUid) 
			&& !angular.isUndefined($routeParams.projetListUrlUid)) {
		
	  $http({
	        method : 'POST',
	        url : 'http://localhost/projetService/urllist',
	        data : 'projetUid='+$scope.projetUid+'&projetListUrlUid='+$scope.projetListUrlUid,
	        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	    }).success(function(data, status, headers, config) {
	    	$scope.app.urlList = data;
	    	$scope.urlListe = data.urlToCheckList;
	    })
	    
	}
	
	$scope.statuses = [{value: 200, text: '200'},
	                   {value: 301, text: '301'},
	                   {value: 302, text: '302'},
	                   {value: 400, text: '400'}]; 

	
	 // remove user
	  $scope.removeUrl = function(index,uid) {
	    $scope.urlListe.splice(index, 1);
	    
	    $http({
	        method : 'POST',
	        url : 'http://localhost/projetService/deleteUrl',
	        data : 'uid='+uid,
	        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	    }).success(function(data, status, headers, config) {
	    })
	    
	  };

	  // add user
	  $scope.addUrl = function() {
	    $scope.inserted = {
	      uid: null,
	      url: '',
	      redirectionUrl1: '',
	      redirectionUrlCode1: '',
	      redirectionUrl2: '',
	      redirectionUrlCode2: '',
	      redirectionUrl3: '',
	      redirectionUrlCode3: ''
	    };
	    $scope.urlListe.push($scope.inserted);
	  };
	  
	  $scope.saveUrl = function(data, uid) {
		  	console.log('test:'+uid);
		    //$scope.user not updated yet
		    //angular.extend(data, {id: id});
		  	data.projetListUrlUid = $scope.projetListUrlUid;
		  	data.uid=uid;
			  $http({
			        method : 'POST',
			        url : 'http://localhost/projetService/addUpdateUrlToList',
			        data : data,
			        headers: {'Content-Type': 'application/json'}
			    }).success(function(data, status, headers, config) {
			    	
			    })
		  	
		  };    
})


app1.controller('liste', function($http,$scope) {
	ctrl = this;
   $http.get("http://localhost/projetService/list")
      .success(function(data) {
		$scope.users = data;
      })
})

app1.controller('loginOut', function($http,$scope) {
	ctrl = this;
	alert('test');
   $http.get("http://localhost/loginService/signeOut")
      .success(function(data) {
    	  window.location  = '/login.html';
      })
})

app1.controller('login', function($http,$scope) {
	var app1 = this;
    app1.setUser = function(user) { 
	$http({
            method : 'POST',
            url : 'http://localhost/loginService/signe',
            data : "password="+user.password+"&username="+user.username,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            
        }).success(function(data, status, headers, config) {
        		
	        	if(data == 'true') {
	        		app1.logSuccess();
	        	} else {
	        		app1.logFail();
	        	}
        	}).error(function(data, status, headers, config) {
        		
        		alert(data);
        	});   
    }
        
    app1.logFail = function() { 
       	alert('log fail')
    }
    
    app1.logSuccess = function() { 
    	window.location  = '/projets.html';
    }
    
    
})





