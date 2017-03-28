'use strict';

angular.module('pollApp', [
	'ngRoute',
	'ngResource',
	'gettext',

	'core',
	// TODO: group-management module
	'groupModify',
	'greet'
]);

angular.module('core', ['core.resources']);

angular.module('greet', [
	'lang-selector'
]);

angular.module('groupModify', []);

angular.module('pollApp')
	.config(["$routeProvider", "$locationProvider", function pollAppConfig($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/greet', {
				template: '<greet></greet>'
			})
			.when('/groups/:groupId', {
				template: '<group-modify></group-modify>'
			})
			.otherwise({
				templateUrl: '404.html'
			});
	}])
	.run(["gettextCatalog", function pollAppRun(gettextCatalog) {
		// cookies & language auto-select
		gettextCatalog.setCurrentLanguage('ru');
		gettextCatalog.loadRemote('po/ru.json');
	}]);

angular
	.module('core.resources', ['ngResource'])
	.factory('Group', ["$resource", function($resource) {
		return $resource('/api/groups/:groupId', {}, {
			delete: {
				method: 'POST',
				params: {
					action: 'delete'
				}
			},
			query: {
				method: 'GET',
				params: { groupId: '' },
				isArray: true
			}
		});
	}])
	.factory('Student', ["$resource", function($resource) {
		return $resource('/api/groups/:groupId/students/:studentId', {}, {
			delete: {
				method: 'POST',
				params: {
					action: 'delete'
				}
			},
			query: {
				method: 'GET',
				params: { studentId: '' },
				isArray: true
			}
		});
	}]);

angular.module('greet')
	.component('greet', {
		controller: ["Group", function greetController(Group) {
			this.name = 'World';
			this.groups = Group.query();
		}],
		templateUrl: 'greet/greet.template.html'
	});

angular
	.module('lang-selector', ['gettext'])
	.component('langSelector', {
		templateUrl: 'lang-selector/lang-selector.template.html',
		controller: ["gettextCatalog", function langSelectorController(gettextCatalog) {
			this.select = function langSelect(lang) {
				gettextCatalog.setCurrentLanguage(lang);
				gettextCatalog.loadRemote('po/' + lang + '.json');
			};
		}]
	});


angular
	.module('groupModify')
	.component('groupModify', {
		templateUrl: 'group-management/group-modify/group-modify.template.html',
		controller: ["$routeParams", "Group", function groupModifyController($routeParams, Group) {
			var self = this;
			this.students = [];

			console.log($routeParams.groupId);

			if ($routeParams.groupId === 'new') {
				this.group = new Group();
			} else {
				this.group = Group.get({
					groupId: $routeParams.groupId
				}, function success() {
					console.log('group', $routeParams.groupId, 'loaded:', self.group);
					self.students = self.group.students;
				}, function error() {
					console.log('error while group', $routeParams.groupId, 'loading');
					// TODO: implement 404 on server side
					self.groupNotFound = true;
				});
			}

			this.studentAdd = function() {
				this.students.push({
					firstName: '',
					lastName: '',
					patronymic: ''
				});
			};

			this.studentDelete = function(s) {
				this.students.splice(this.students.indexOf(s), 1);
			};

			this.changesSave = function() {
				// TODO: check if all students have names (form.isValid or something)
				this.group.students = this.students.slice(0, this.students.length - 1);
				this.group.$save(function() {
					console.log('Successfully saved group');
				}, function() {
					console.log('Error while saving group');
				});
			};
		}]
	});
