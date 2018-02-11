angular
	.module('groupModify')
	.component('groupModify', {
		templateUrl: 'group-management/group-modify/group-modify.template.html',
		controller: function groupModifyController(
			$routeParams, Group, gettextCatalog, messenger,
			EduForm, Specialty) {
			var noop = function() {},
				errLog = function(err) { console.log(err); };

			if ($routeParams.groupId === 'new') {
				this.group = new Group({
					students: [],
					groupName: '',
					index: undefined
				});
			} else {
				this.groupId = $routeParams.groupId;
				this.group = Group.get({
					groupId: this.groupId
				}, function() {}, function error(err) {
					console.log('Error while group', $routeParams.groupId, 'loading:', err.statusText);
					this.notFound = true;
				}.bind(this));
			}

			this.eduForms = EduForm.query(noop, errLog);
			this.specialties = Specialty.query(noop, errLog);

			this.studentAdd = function() {
				this.group.students.push({
					firstName: '',
					lastName: '',
					patronymic: ''
				});
			};

			this.massStudentsAdd = function() {
				this.group.students = this.group.students.concat(
					this.studentsRawList
						.split('\n')
						.filter(function(line) {
							return line;
						})
						.map(function(line) {
							var s = {
									firstName: '',
									lastName: '',
									patronymic: ''
								},
								idx1, idx2;

							idx1 = line.indexOf(' ');
							if (idx1 === -1) {
								s.lastName = line;
								return s;
							}
							s.lastName = line.substring(0, idx1);

							idx2 = line.indexOf(' ', idx1 + 1);
							if (idx2 === -1) {
								s.firstName = line.substring(idx1 + 1);
								return s;
							}
							s.firstName = line.substring(idx1 + 1, idx2);
							s.patronymic = line.substring(idx2 + 1);

							return s;
						})
				);
				this.textareaShowHide();
			};

			this.textareaShowHide = function() {
				this.textareaIsVisible = !this.textareaIsVisible;
				this.studentsRawList = '';
			};

			this.studentsRawListCount = function() {
				return this.studentsRawList
					.split('\n')
					.filter(function(line) {
						return line;
					})
					.length;
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
				if (this.form.$invalid) {
					return;
				}

				if (!this.group.students.every(function(s) {
					return s.firstName && s.lastName;
				})) {
					messenger.show({
						title: gettextCatalog.getString('Error'),
						message: gettextCatalog.getString('Name or surname is missing'),
						isError: true
					});
					return;
				}

				this.group.$save({
					groupId: this.groupId ? this.groupId : ''
				},
				function() {
					messenger.show({
						title: gettextCatalog.getString('Done'),
						message: gettextCatalog.getString('Group successfully saved')
					});
					this.groupId = this.group._id;
				}.bind(this), function(err) {
					console.warn('Error while saving group', err);
					if (err.data.error === 'Validation error') {
						messenger.show({
							title: gettextCatalog.getString('Error'),
							message: gettextCatalog.getString('Form validation failed'),
							isError: true
						});
						return;
					}
					if (err.data.error === 'Duplicate key error') {
						messenger.show({
							title: gettextCatalog.getString('Error'),
							message: gettextCatalog.getString('Group number have to be unique'),
							isError: true
						});
						return;
					}
					messenger.show({
						title: gettextCatalog.getString('Error'),
						message: err.data.error,
						isError: true
					});
				});
			};

			this.hasError = function() {
				return this.form.index.$touched &&
					this.form.index.$invalid;
			};
		}
	});
