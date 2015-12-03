/* global angular */
'use strict';


angular.module('uiTestRunner', ['ngRoute', 'ngStorage', 'md.data.table', 'ngMaterial']);

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
	.controller('MainController', function MainController($localStorage, $location, $mdDialog) {
		this.Tests = $localStorage.Tests || ($localStorage.Tests = []);
		this.add = function (event) {
			$mdDialog.show({
				clickOutsideToClose: true,
				controller: 'NewTestController',
				controllerAs: 'vm',
				focusOnOpen: false,
				targetEvent: event,
				templateUrl: 'edit.html',
			}).then(function (test) {
				console.log(test);
			});
		}
		this.edit = function (event, test) {
			$mdDialog.show({
				clickOutsideToClose: true,
				controller: 'EditTestController',
				controllerAs: 'vm',
				focusOnOpen: false,
				targetEvent: event,
				templateUrl: 'edit.html',
				locals: {
					test: test
				}
			}).then(function (test) {
				console.log(test);
			});
		}

		this.remove = function (test) {
			var idx = $localStorage.Tests.indexOf(test);
			$localStorage.Tests.splice(idx, 1);
		}
	})
	.controller("NewTestController", function NewTestController($localStorage, $location, GuidGeneratorService, $mdDialog) {
		$localStorage.Tests = $localStorage.Tests || [];
		var self = this;
		this.Cancel = function () {
			$mdDialog.hide();
		};
		this.Save = function () {
			var test = {
				Guid: GuidGeneratorService(),
				Url: self.Url,
				Code: self.Code,
				Name: self.Name,
				Tags: self.Tags,
			};
			$localStorage.Tests.push(test);
			$mdDialog.hide(test);
		};
	})
	.controller("EditTestController", function EditTestController($localStorage, test, $location, $mdDialog) {
		var self = this;
		angular.extend(this, test);
		self.Cancel = function () {
			$mdDialog.hide();
		};
		self.Save = function () {
			var testToUpdate = $localStorage.Tests.find(function (t) {
				return t.Guid === self.Guid;
			});
			testToUpdate.Url = self.Url;
			testToUpdate.Code = self.Code;
			testToUpdate.Name = self.Name;
			testToUpdate.Tags = self.Tags;

			$mdDialog.hide(testToUpdate);
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
			.when('/Edit/:guid', {
				templateUrl: 'edit.html',
				controller: 'EditTestController',
				controllerAs: 'vm',
				resolve: {
					test: function ($localStorage, $route) {
						var guid = $route.current.params.guid;
						return $localStorage.Tests.find(function (test) {
							return test.Guid === guid;
						});
					}
				}
			})
			.otherwise({
				redirectTo: '/Home'
			});

	});
	