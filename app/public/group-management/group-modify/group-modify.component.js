angular
	.module('groupModify')
	.component('groupModify', {
		templateUrl: 'group-management/group-modify/group-modify.template.html',
		controller: function groupModifyController($routeParams, Group) {
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
		}
	});
