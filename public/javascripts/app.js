angular.module('VIZ', ['ngRoute'])
	
    .controller('LoginController', ['$scope', '$window', 'UserService', function ($scope, $window, UserService) {
        
        $scope.message = '';
        
        $scope.Login = function (username, password) {
            UserService.login(username, password).then(function () { }, function (message) {
                $scope.message = message;
            });
        };
    }])

    .factory('AuthenticateService', ['$window', function ($window) {
        var factory = {};
        
        var isLoged = false;
        // Clear token from session storage and set is loged to false
        factory.clearUser = function () {
            isLoged = false;
            delete $window.sessionStorage.token;
        };
        
        // Set is loged to true
        factory.setUserLoged = function () {
            isLoged = true;
        }
        
        // Set user token to session and is loged to true
        factory.setUserToken = function (token) {
        	console.log(token);
            factory.setUserLoged();
            $window.sessionStorage.token = token;
        };
        
        // Return is loged
        factory.getUserStatus = function () {
        	if(checkToken())
        	{
        		factory.setUserToken(factory.getToken());
        	}
            return isLoged;
        }

        function checkToken()
        {
        	if ($window.sessionStorage.token)
        		return true;
        	else 
        		return false;
        }
        
        // Check if token exists and return it, if not return empty object
        factory.getToken = function () {
            if (checkToken()) {
                factory.setUserLoged();
                return $window.sessionStorage.token;
            
            }
            else {
                return {};
            }
            
        }
        return factory;
    }])

    .factory('UserService', ['$q', '$http', 'AuthenticateService', '$location', function ($q, $http, AuthenticateService, $location) {
        var factory = {};
        
        factory.pin = function(pin) {
        	var deffered = $q.defer();

        	$http.post('/api/LoginPin',{ pin : pin}).success(function(token){
        		Authentication.setUserToken(token);
        		$location.location('/');

        		deffered.resolve();
        	}).error(function(){
        		AuthenticateService.clearUser();
        		$location.path('/login');
        		deffered.reject();
        	});

        	return deffered.promise;
        }

        factory.login = function (username, password) {
            var deffered = $q.defer();
            $http.post('/api/Login',{ username: username, password: password }).success(function (data) {
                AuthenticateService.setUserToken(data);
                $location.path('/');
                deffered.resolve();
            })
            .error(function (data) {
                AuthenticateService.clearUser();
                $location.path('/');
                deffered.reject('Invalid username/password');
            });
            
            return deffered.promise;
        }
        
        factory.logut = function () {
            AuthenticateService.clearUser();
            
            $location.path('/login');
        }
        
        factory.register = function (user) {
            var deffered = $q.defer();
            console.log(user);
            $http.post('api/Register/', { username: user.username, password : user.password }).success(function (data) {
                deffered.resolve('Uspešna registarcija');
            }).error(function (data) {
                deffered.resolve(data);
            });
            
            return deffered.promise;
        }
        
        return factory;
    }])

    .factory('TokenInterceptor', ['$q', '$location', 'AuthenticateService', function ($q, $location, AuthenticateService) {
        return {
            request : function (config) {
                config.headers = config.headers || {};
                
                // We don't care if token don't exists, server will hande invalid token
                config.headers.Authorization = 'Bearer ' + AuthenticateService.getToken();

                return config;
            },
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            
            /* Set Authentication.isAuthenticated to true if 200 received */
            response: function (response) {
                // If response is ok, and user status is not loged, set user status to loged
                if (response!= null && response.status == 200 && !AuthenticateService.getUserStatus()) {
                    AuthenticateService.setUserLoged();
                }
                return response || $q.when(response);
            },
            
            /* Revoke client authentication if 401 is received */
            responseError: function (rejection) {
                // If response status is 401 and user is loged, delete user info
                if (rejection != null && rejection.status === 401 && AuthenticateService.getUserStatus()) {
                    AuthenticateService.clearUser();
                    $location.path("/login");
                }
                
                return $q.reject(rejection);
            }
        };
    }])

    .config(['$httpProvider', function ($httpProvider) {
        // Add token interceptor to http interceptors
        $httpProvider.interceptors.push('TokenInterceptor');
    }])
    // Config application routes
    .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
        $routeProvider.when('/', {
            templateUrl: '/partials/secret/',
            access : { requiredLogin: true,
            	twoStep : true
             }
        })
        .when('/login', {
            templateUrl: 'login_partial.html',
            access : { requiredLogin: false }
        })
        .when('/registration', {
            templateUrl: 'registration_partial.html',
            access : { requiredLogin: false }
        })
        .otherwise({
            redirectTo: '/'
        });

    }])
    .run(['$rootScope', '$location', 'AuthenticateService', '$window', function ($rootScope, $location, AuthenticateService, $window) {
        
        $rootScope.$on("$routeChangeStart", function (event, nextRoute, currentRoute) {
        	console.log('Current route',currentRoute);
        	console.log('Next route', nextRoute);
            if (nextRoute.access) {
                // If next route require loged user & user is not loged redirect him to login page
                console.log(nextRoute.access);
                if (nextRoute.access.requiredLogin && !AuthenticateService.getUserStatus()) {
                    $location.path("/login");
                }
            }

        });
    }])
    .controller('RegistrationController', ['$scope', 'UserService', function ($scope, UserService) {
        $scope.message = "";
        
        $scope.user = {};
        
        $scope.register = function () {
            UserService.register($scope.user).then(function (successMsg) {
                $scope.message = successMsg;
                $scope.user = {};
            }, function (errorMsg) {
                $scope.message = successMsg;
            });
        };

    }])
    .directive("compareTo", compareTo);

function compareTo () {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function (scope, element, attributes, ngModel) {
            
            ngModel.$validators.compareTo = function (modelValue) {
                console.log('Compare-to', modelValue);
                console.log('OtherModel', scope.otherModelValue);
                console.log('Rezultat', modelValue == scope.otherModelValue);
                return modelValue == scope.otherModelValue;
            };
            
            scope.$watch("otherModelValue", function () {
                ngModel.$validate();
            });
        }
    };
};
