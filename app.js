/* global angular */
'use strict';

// In this example, we set up our model using a class.
// Using a plain object works too. All that matters
// is that we implement getItemAtIndex and getLength.
var DynamicItems = function (repo) {
	/**
	 * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
	 */
	this.loadedPages = {};
	/** @type {number} Total number of items. */
	this.numItems = 0;
	/** @const {number} Number of items to fetch per request. */
	this.PAGE_SIZE = 5;
	this.repo = repo;

	this.fetchPage_(0);
};
// Required.
DynamicItems.prototype.getItemAtIndex = function (index) {
	var pageNumber = Math.floor(index / this.PAGE_SIZE);
	var page = this.loadedPages[pageNumber];
	if (page === undefined) {
		this.fetchPage_(pageNumber);
		page = this.loadedPages[pageNumber];
	}
	return page[index % this.PAGE_SIZE];
};
// Required.
DynamicItems.prototype.getLength = function () {
	return this.numItems;
};

DynamicItems.prototype.fetchPage_ = function (pageNumber) {
	// Set the page to null so we know it is already being fetched.
	var result = this.repo.find({ offset: pageNumber * this.PAGE_SIZE, size: this.PAGE_SIZE });
	this.loadedPages[pageNumber] = result.records;
	this.numItems = result.totalCount;
	console.log("Pobrałem stronę ", pageNumber)
};

function populate(items) {
	var data = [];
	for (var i = 0; i < items; i += 1) {
		var test = { guid: i.toString(), name: "Dupa" + i, url: "http://dupa.net/" + i + ".html" };
		data.push(test);
	}
	window.localStorage.setItem("ngStorage-tests", JSON.stringify(data));
}

//--------------------------------


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
	.service('testRepository', function testRepository($localStorage, $filter, guidGeneratorService) {
		$localStorage.tests = $localStorage.tests || [];

		var find = function (data) {
			data = data || {};
			var list = $localStorage.tests;
			if (data.searchText) {
				list = $filter('filter')(list, { name: data.searchText });
			}
			return { totalCount: list.length, records: list.slice(data.offset || 0, (data.offset || 0) + (data.size || 4)) };
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
			find: find,
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
		// var result = testRepository.find();
		// self.totalCount = result.totalCount;
		// self.tests = result.records;
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
				self.search();
			});
		};

		self.remove = function (event, test) {
			event.stopPropagation();
			testRepository.remove(test);
			self.search();
		};

		self.onKeyUp = function (event) {
			if (event.keyCode === 13) {
				self.search();
			} else if (event.keyCode === 27) {
				self.hideSearch();
			}
		};

		self.search = function () {
			var result = testRepository.find({ searchText: self.searchText });
			self.totalCount = result.totalCount;
			self.tests = result.records;
		};

		self.hideSearch = function () {
			self.searchText = null;
			var result = testRepository.find();
			self.totalCount = result.totalCount;
			self.tests = result.records;
			self.isSearchVisible = false;
		};

		self.showSearch = function () {
			self.isSearchVisible = true;
		};

		self.dynamicItems = new DynamicItems(testRepository);
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
	