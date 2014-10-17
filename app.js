var app1 = angular.module('main', ['ngRoute','ngTable','ngResource','xeditable','angularFileUpload']).config(function($routeProvider, $locationProvider, $httpProvider) {
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
              window.location  = '/login.html';
            }
      });

      return deferred.promise;
    };
    //================================================
    
    app1.factory('UrlListService', ['$http', function ($http) {
        var loadUrl = function (projetUid,projetListUrlUid) {
        	    $http({
		        method : 'POST',
		        url : 'http://localhost/projetService/urllist',
		        data : 'projetUid='+projetUid+'&projetListUrlUid='+projetListUrlUid,
		        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		    }).success(function(data, status, headers, config) {
		    	    return data;
		    })
		    
		    return {};
        };  
    }])
    
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
            	window.location  = '/login.html';
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
    
    $http({
        method : 'POST',
        url : 'http://localhost/projetService/comptesUsers',
        data : 'projetUid='+$routeParams.projetUid,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
    	$scope.otherUsers = data;
    	$scope.ouDefault = $scope.otherUsers[0];
    })
        
    $scope.app.addUser = function (user) {
		
	    $http({
	        method : 'POST',
	        url : 'http://localhost/projetService/addProjetUser',
	        data : 'projetUid='+$routeParams.projetUid+'&userUid='+user.uid,
	        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	    }).success(function(data, status, headers, config) {
	    	$scope.users.push(user);
	    	var index=$scope.otherUsers.indexOf(user);
	    	$scope.otherUsers.splice(index,1);
	    	$scope.ouDefault = $scope.otherUsers[0];
	    })
	}
    
	
})

app1.controller('parameters', function($http,$scope,$routeParams) {
	$scope.projetListUrlUid = $routeParams.projetListUrlUid;
	
	$scope.jours = [{name: 'Lundi'},{name: 'Mardi'},{name: 'Mercredi'},{name: 'Jeudi'},{name: 'Vendredi'},{name: 'Samedi'},{name: 'Dimanche'}];
	
	$scope.heures = [];
	for(var $i=0;$i<24;$i++) {
		$scope.heures.push({heure: $i});
	}
	$scope.heureDefault = $scope.heures[0];
	$scope.minutes = [];
	for(var $i=0;$i<60;$i++) {
		$scope.minutes.push({minute: $i});
	}
	$scope.minutesDefault = $scope.minutes[0];
	$scope.numeroJours = [];
	for(var $i=1;$i<29;$i++) {
		$scope.numeroJours.push({numero: $i});
	}
	$scope.numJourDefault = $scope.numeroJours[0];
	$scope.jourDefault = $scope.jours[0];
	
	
	  $http({
	        method : 'GET',
	        url : 'http://localhost/projetService/useragents'
	    }).success(function(resp1, status, headers, config) {
	    	$scope.userAgents = resp1;
	    	$scope.uaDefault = $scope.userAgents[0];
	    	
	  	  $http({
	            method : 'POST',
	            url : 'http://localhost/projetService/parameters/get',
	            data : 'projetListUrlUid='+$scope.projetListUrlUid,
	            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	        }).success(function(resp2, status, headers, config) {
	        	$scope.parameters = resp2;
	        	//alert($scope.userAgents.length);
	        	for($i=0;$i<$scope.userAgents.length;$i++) {
		    		if($scope.parameters.userAgentUid == $scope.userAgents[$i].uid) {
		    			$scope.uaDefault = $scope.userAgents[$i];
		    		}
		    	}
	        })
	    })
		    
   $scope.app.saveParameters = function(parameters) { 
		$http({
	            method : 'POST',
	            url : 'http://localhost/projetService/parameters/save',
	            data : parameters
	        })
    }
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
	$scope.types = [{uid: '1', name: 'oneshot'},{uid: '2',name: 'planifiée'}]; 
	$scope.typeDefault = $scope.types[1];
	
	$scope.app.saveInfos = function(urlList) { 
		urlList.projetUid = $scope.projetUid;
		urlList.typeUid = $scope.typeDefault.uid;
		$http({
	            method : 'POST',
	            url : 'http://localhost/projetService/addUrllist',
	            data : urlList
	        }).success(function(data, status, headers, config) {
	        	$location.path("/liste-detail/"+$scope.projetUid+"/"+data.uid);
		    })
	    }
	    

})

app1.factory('userRepository', function($http) {
    return { 
    	
    	     loadUrls : function (scope,projetUid,projetListUrlUid) {
    		
    		$http({
		        method : 'POST',
		        url : 'http://localhost/projetService/urllist',
		        data : 'projetUid='+projetUid+'&projetListUrlUid='+projetListUrlUid,
		        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		    }).success(function(data, status, headers, config) {
			    	scope.app.urlList = data;
			    	scope.urlListe = data.urlToCheckList;
		    })
    	}
    };
 });


app1.controller('listeDetail', function($http,$scope,$routeParams, FileUploader,userRepository) {
	
	$scope.projetUid = $routeParams.projetUid;
	$scope.projetListUrlUid = $routeParams.projetListUrlUid;
	$scope.app.urlList = {};
	$scope.urlListe = {};	
	$scope.app.loadUrlList = function() {
		     userRepository.loadUrls($scope,$scope.projetUid,$scope.projetListUrlUid);	    
		}
	
	if(!angular.isUndefined($routeParams.projetUid) 
			&& !angular.isUndefined($routeParams.projetListUrlUid)) {
		$scope.app.loadUrlList();
	}
	
    //This function is sort of private constructor for controller
    $scope.uploader = new FileUploader();
    $scope.uploader.url = 'projetService/listes/upload/csv';
    $scope.uploader.formData = [{projetListUrlUid:$scope.projetListUrlUid}];
    $scope.uploader.onCompleteItem = function(item, response, status, headers) {
    		$scope.app.loadUrlList();	
    }
	
	$scope.app.submitSitemap = function(urlSitemap) {
		$http({
	        method : 'POST',
	        url : 'http://localhost/projetService/listes/sitemap/save',
	        data : 'projetListUrlUid='+$scope.projetListUrlUid+'&sitemapUrl='+urlSitemap,
	        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	    }).success(function(data, status, headers, config) {
	    		$scope.app.loadUrlList();;
	    })
	}
	
	$scope.statuses = [{value: 200, text: '200'},
	                   {value: 201, text: '201'},
	                   {value: 202, text: '202'},
	                   {value: 203, text: '203'},
	                   {value: 204, text: '204'},
	                   {value: 205, text: '205'},
	                   {value: 206, text: '206'},
	                   {value: 207, text: '207'},
	                   {value: 210, text: '210'},
	                   {value: 226, text: '226'},
	                   {value: 300, text: '300'},
	                   {value: 301, text: '301'},
	                   {value: 302, text: '302'},
	                   {value: 303, text: '303'},
	                   {value: 304, text: '304'},
	                   {value: 305, text: '305'},
	                   {value: 306, text: '306'},
	                   {value: 307, text: '307'},
	                   {value: 308, text: '308'},
	                   {value: 310, text: '310'},
	                   {value: 400, text: '400'},
	                   {value: 401, text: '401'},
	                   {value: 402, text: '402'},
	                   {value: 403, text: '403'},
	                   {value: 404, text: '404'},
	                   {value: 405, text: '405'},
	                   {value: 406, text: '406'},
	                   {value: 407, text: '407'},
	                   {value: 408, text: '408'},
	                   {value: 409, text: '409'},
	                   {value: 410, text: '410'},
	                   {value: 411, text: '411'},
	                   {value: 412, text: '412'},
	                   {value: 413, text: '413'},
	                   {value: 414, text: '414'},
	                   {value: 415, text: '415'},
	                   {value: 416, text: '416'},
	                   {value: 417, text: '417'},
	                   {value: 418, text: '418'},
	                   {value: 422, text: '422'},
	                   {value: 423, text: '423'},
	                   {value: 424, text: '424'},
	                   {value: 425, text: '425'},
	                   {value: 426, text: '426'},
	                   {value: 428, text: '428'},
	                   {value: 429, text: '429'},
	                   {value: 431, text: '431'},
	                   {value: 449, text: '449'},
	                   {value: 450, text: '450'},
	                   {value: 456, text: '456'},
	                   {value: 499, text: '499'},
	                   {value: 500, text: '500'},
	                   {value: 501, text: '501'},
	                   {value: 502, text: '502'},
	                   {value: 503, text: '503'},
	                   {value: 504, text: '504'},
	                   {value: 505, text: '505'},
	                   {value: 506, text: '506'},
	                   {value: 507, text: '507'},
	                   {value: 508, text: '508'},
	                   {value: 509, text: '509'},
	                   {value: 510, text: '510'},
	                   {value: 520, text: '520'}]; 

	
	 // remove user
	  $scope.removeUrl = function(index,uid) {
	    $scope.urlListe.splice(index, 1);
	    if(uid != null) {
		    $http({
		        method : 'POST',
		        url : 'http://localhost/projetService/deleteUrl',
		        data : 'uid='+uid,
		        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		    }).success(function(data, status, headers, config) {
		    })
	    }
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







