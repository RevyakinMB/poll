angular
	.module('groupModify')
	.component('groupModify', {
		templateUrl: 'group-management/group-modify/group-modify.template.html',
		controller: function groupModifyController(
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
		}
	});
