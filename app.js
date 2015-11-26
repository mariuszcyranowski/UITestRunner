/* global angular */
'use strict';

angular.module('uiTestRunner', ['ngRoute', 'ngStorage']);

angular.module('uiTestRunner').
	controller('MainController', function MainController($localStorage) {
		this.search = $localStorage.search;
		
	})
	.controller("NewTestController", function NewTestController($localStorage) {
		$localStorage.search = new Date().toString();
	})
	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/Home', {
				templateUrl : 'main.html',
				controller : 'MainController',
				controllerAs : 'vm'
			})
			.when('/New', {
				templateUrl : 'edit.html',
				controller : 'NewTestController',
				controllerAs : 'vm'	
			})
			.otherwise({
				redirectTo: '/Home'
			});
		
	});
	