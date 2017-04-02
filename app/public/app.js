'use strict';

angular.module('pollApp', [
	'ngRoute',
	'ngResource',
	'gettext',

	// TODO: group-management module
	'groupModify',
	'utils',
	'greet'
]);

angular.module('core', ['core.resources']);

angular.module('greet', [
	'lang-selector'
]);

angular.module('utils', []);

angular.module('groupModify', [
	'core',
	'gettext'
]);

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
	.module('utils')
	.directive('capitalization', function() {
		var nonCapitalizedBits = ['von', 'av', 'af', 'de', 'di'],
			isValid = function(name) {
				if (!name) {
					return true;
				}
				if (nonCapitalizedBits.indexOf(name.split(' ')[0]) !== -1) {
					return true;
				}
				return name[0].toUpperCase() === name[0];
			};
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function capitalizationLink(scope, element, attrs, ctrl) {
				ctrl.$validators.capitalization = function(modelValue, viewValue) {
					return isValid(modelValue || viewValue);
				};
			}
		};
	});

angular
	.module('groupModify')
	.component('groupModify', {
		templateUrl: 'group-management/group-modify/group-modify.template.html',
		controller: ["$routeParams", "Group", "gettextCatalog", "$timeout", function groupModifyController(
			$routeParams, Group, gettextCatalog, $timeout) {
			if ($routeParams.groupId === 'new') {
				this.group = new Group();
				this.group.students = [];
				this.group.groupName = '';
			} else {
				this.groupId = $routeParams.groupId;
				this.group = Group.get({
					groupId: this.groupId
				}, function() {}, function error(err) {
					console.log('Error while group', $routeParams.groupId, 'loading:', err.statusText);
					this.groupNotFound = true;
				}.bind(this));
			}

			this.studentAdd = function() {
				this.group.students.push({
					firstName: '',
					lastName: '',
					patronymic: ''
				});
			};

			// TODO: one-way binding and studentUpdate call from student-info directive
			// this.studentUpdate = function(s, $event) {
			//	var idx = this.group.students.indexOf(s);
			//	this.group.students[idx] = $event.student;
			// };

			this.studentDelete = function(s) {
				this.group.students.splice(this.group.students.indexOf(s), 1);
			};

			this.messageShow = function(options) {
				if (options.isError) {
					this.errorMessage = options.message;
				} else {
					this.successMessage = options.message;
				}
				$timeout(function() {
					delete this.errorMessage;
					delete this.successMessage;
				}.bind(this), options.isError ? 5000 : 3000);
			};

			this.changesSave = function() {
				var isValid = this.group.students.every(function(s) {
					return s.firstName && s.lastName;
				});
				if (!isValid) {
					this.messageShow({
						message: gettextCatalog.getString('Error: name or surname is missing'),
						isError: true
					});
					return;
				}
				this.group.$save({
					groupId: this.groupId ? this.groupId : ''
				},
				function() {
					this.messageShow({
						message: gettextCatalog.getString('Group successfully saved'),
						isError: false
					});
					this.groupId = this.group._id;
				}.bind(this), function(err) {
					console.warn('Error while saving group', err.stack);
					if (err.data.error === 'Validation error') {
						this.messageShow({
							message: gettextCatalog.getString('Error: form validation failed'),
							isError: true
						});
						return;
					}
					this.messageShow({
						message: gettextCatalog.getString('Error:') + ' ' + err.data.error,
						isError: true
					});
				}.bind(this));
			};
		}]
	});

angular
	.module('groupModify')
	// directive is to address DOM modification
	.directive('studentInfo', function() {
		return {
			scope: {},
			bindToController: {
				student: '=',
				index: '@',
				onDelete: '&'
			},
			templateUrl: 'group-management/group-modify/student-info.template.html',
			controller: ["$element", "$compile", "$scope", "gettextCatalog", function studentInfoController(
				$element, $compile, $scope, gettextCatalog) {
				var studentNonEmpty = function(s) {
					return s.firstName || s.lastName || s.patronymic;
				};

				this.editorOpen = function() {
					if (this.editor) {
						return;
					}
					this.editor = $compile([
						'<student-modify',
						' student="ctrl.student"',
						' on-update="ctrl.studentEdited($event)"',
						' on-close="ctrl.editorClose()"',
						'></student-modify>'
					].join(''))($scope);
					$element.append(this.editor);
				};

				this.editorClose = function() {
					if (!this.editor || this.editor.length !== 1) {
						return;
					}
					this.editor[0].parentNode.removeChild(this.editor[0]);
					this.editor = undefined;
					if (!studentNonEmpty(this.student)) {
						this.onDelete();
					}
				};

				// editor component API
				this.studentEdited = function($event) {
					['firstName', 'lastName', 'patronymic'].forEach(
						function(param) {
							this.student[param] = $event.student[param];
						}, this);
					this.editorClose();
				};

				this.studentDelete = function() {
					this.onDelete();
				};

				// template helpers
				this.studentFullName = function() {
					if (studentNonEmpty(this.student)) {
						// TODO: es2015 string template
						return this.student.lastName + ' ' +
							this.student.firstName + ' ' +
							this.student.patronymic;
					}
					return gettextCatalog.getString('Enter name');
				};

				// open editor on empty student
				this.$onInit = function() {
					if (!studentNonEmpty(this.student)) {
						this.editorOpen();
					}
				};
			}],
			controllerAs: 'ctrl'
		};
	});

angular
	.module('groupModify')
	.component('studentModify', {
		bindings: {
			student: '<',
			onUpdate: '&',
			onClose: '&'
		},
		templateUrl: 'group-management/group-modify/student-modify.template.html',
		controller: function studentModifyController() {
			this.$onChanges = function(changes) {
				if (changes.student) {
					// make a copy of object to make it really one-way bind
					this.student = angular.copy(changes.student.currentValue);
				}
			};

			this.studentSave = function() {
				if (this.form.$invalid) {
					angular.forEach(this.form, function(value) {
						if (typeof value === 'object' &&
								Object.prototype.hasOwnProperty.call(value, '$modelValue')) {
							value.$setTouched();
						}
					});
					return;
				}
				this.onUpdate({
					$event: {
						student: this.student
					}
				});
			};

			this.hasError = function(input) {
				return input.$touched && input.$invalid;
			};
		}
	});
