angular
	.module('groupModify')
	.component('groupModify', {
		templateUrl: 'group-management/group-modify/group-modify.template.html',
		controller: function groupModifyController(
			$routeParams, Group, gettextCatalog, messenger) {
			// initialize Group model
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

			// page interaction feedback
			this.message = {
				text: '',
				error: false,
				hidden: true
			};

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

			// TODO: let user to undo last delete
			this.studentDelete = function(s) {
				this.group.students.splice(this.group.students.indexOf(s), 1);
			};

			this.changesSave = function() {
				var isValid = this.group.students.every(function(s) {
					return s.firstName && s.lastName;
				});
				if (!isValid) {
					messenger({
						message: gettextCatalog.getString('Error: name or surname is missing'),
						isError: true
					}, this.message);
					return;
				}
				this.group.$save({
					groupId: this.groupId ? this.groupId : ''
				},
				function() {
					messenger({
						message: gettextCatalog.getString('Group successfully saved')
					}, this.message);
					this.groupId = this.group._id;
				}.bind(this), function(err) {
					console.warn('Error while saving group', err);
					if (err.data.error === 'Validation error') {
						messenger({
							message: gettextCatalog.getString('Error: form validation failed'),
							isError: true
						}, this.message);
						return;
					}
					messenger({
						message: gettextCatalog.getString('Error:') + ' ' + err.data.error,
						isError: true
					}, this.message);
				}.bind(this));
			};
		}
	});
