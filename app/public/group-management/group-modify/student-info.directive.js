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
			controller: function studentInfoController(
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
			},
			controllerAs: 'ctrl'
		};
	});
