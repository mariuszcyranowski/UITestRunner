/* global angular */
'use strict';


angular.module('uiTestRunner', ['ngRoute', 'ngStorage', 'ngMaterial', 'ui.ace', 'ngMdIcons']);

angular.module('uiTestRunner')
	.service("guidGeneratorService", function () {
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
	.service('testRepository', function testRepository($localStorage, guidGeneratorService) {
		$localStorage.Tests = $localStorage.Tests || [];

		var all = function () {
			return $localStorage.Tests;
		};

		var save = function (test) {
			var testToSave;

			if (test.Guid) {
				testToSave = $localStorage.Tests.find(function (t) {
					return t.Guid === test.Guid;
				});
			} else {
				testToSave = {
					Guid: guidGeneratorService()
				};
				$localStorage.Tests.push(testToSave);
			}
			testToSave.Url = test.Url;
			testToSave.Code = test.Code;
			testToSave.Name = test.Name;
			testToSave.Tags = test.Tags;
		};

		var remove = function (test) {
			var idx = $localStorage.Tests.indexOf(test);
			$localStorage.Tests.splice(idx, 1);
		};

		return {
			all: all,
			save: save,
			remove: remove
		};
	})
	.directive('mdToolbarTools', function () {
		return {
			restrict: 'E',
			template: '<div ng-transclude class="md-toolbar-tools"></div>',
			transclude: true
		};
	})
	.controller('MainController', function MainController(testRepository, $mdDialog, $filter) {
		var self = this;
		self.Tests = testRepository.all();
		self.add = function (event) {
			self.edit(event, { Tags: [] });
		};

		self.edit = function (event, test) {
			event.stopPropagation();
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
		};

		self.remove = function (test) {
			testRepository.remove(test);
		};

		self.onKeyUp = function (event) {
			if (event.keyCode === 13) {
				self.search();
			} else if (event.keyCode === 27) {
				self.hideSearch();
			}
		};

		self.search = function () {
			self.Tests = $filter('filter')(testRepository.all(), { Name: self.searchText });
		};
		
		self.hideSearch = function() {
			self.searchText = null;
			self.Tests = testRepository.all();
			self.isSearchVisible = false;
		};
		
		self.showSearch = function() {
			self.isSearchVisible = true;
		};
	})
	.controller("EditTestController", function EditTestController(testRepository, test, $mdDialog) {
		var self = this;
		angular.extend(this, test);
		self.Cancel = function () {
			$mdDialog.hide();
		};
		self.Save = function () {
			var testToUpdate = {
				Guid: self.Guid,
				Url: self.Url,
				Code: self.Code,
				Name: self.Name,
				Tags: self.Tags,
			};
			testRepository.save(testToUpdate);
			$mdDialog.hide(testToUpdate);
		};
	})
	.config(function ($routeProvider) {
		$routeProvider
			.when('/Home', {
				templateUrl: 'main.html',
				controller: 'MainController',
				controllerAs: 'vm'
			})
			.otherwise({
				redirectTo: '/Home'
			});
	});
	