/* global angular */
'use strict';


angular.module('uiTestRunner', ['ngRoute', 'ngStorage', 'ngMaterial', 'ui.ace', 'ngMdIcons', 'focus-if']);

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
		$localStorage.tests = $localStorage.tests || [];

		var all = function () {
			return $localStorage.tests;
		};

		var save = function (test) {
			var testToSave;

			if (test.guid) {
				testToSave = $localStorage.tests.find(function (t) {
					return t.guid === test.guid;
				});
			} else {
				testToSave = {
					guid: guidGeneratorService()
				};
				$localStorage.tests.push(testToSave);
			}
			testToSave.url = test.url;
			testToSave.code = test.code;
			testToSave.name = test.name;
			testToSave.tags = test.tags;
		};

		var remove = function (test) {
			var idx = $localStorage.tests.indexOf(test);
			$localStorage.tests.splice(idx, 1);
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
		self.tests = testRepository.all();
		self.add = function (event) {
			self.edit(event, { tags: [] });
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
			self.tests = $filter('filter')(testRepository.all(), {name: self.searchText });
		};
		
		self.hideSearch = function() {
			self.searchText = null;
			self.tests = testRepository.all();
			self.isSearchVisible = false;
		};
		
		self.showSearch = function() {
			self.isSearchVisible = true;
		};
	})
	.controller("EditTestController", function EditTestController(testRepository, test, $mdDialog) {
		var self = this;
		angular.extend(this, test);
		self.cancel = function () {
			$mdDialog.hide();
		};
		self.save = function () {
			var testToUpdate = {
				guid: self.guid,
				url: self.url,
				code: self.code,
				name: self.name,
				tags: self.tags,
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
	