/* global angular */
'use strict';


angular.module('uiTestRunner', ['ngRoute', 'ngStorage']);

angular.module('uiTestRunner')
	.service("GuidGeneratorService", function () {
		return function guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		};
	})
	.controller('MainController', function MainController($localStorage) {
		this.Tests = $localStorage.Tests;
	})
	.controller("NewTestController", function NewTestController($localStorage, $location, GuidGeneratorService) {
		$localStorage.Tests = $localStorage.Tests || [];
		var self = this;
		this.Save = function () {
			$localStorage.Tests.push({
				Guid: GuidGeneratorService(),
				Url: self.Url,
				Code: self.Code,
				Name: self.Name,
				Tags: self.Tags,
			});
			$location.path("Home");
		};
	})
	.config(function ($routeProvider, $locationProvider) {
		$routeProvider
			.when('/Home', {
				templateUrl: 'main.html',
				controller: 'MainController',
				controllerAs: 'vm'
			})
			.when('/New', {
				templateUrl: 'edit.html',
				controller: 'NewTestController',
				controllerAs: 'vm'
			})
			.otherwise({
				redirectTo: '/Home'
			});

	});
	