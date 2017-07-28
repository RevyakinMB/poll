angular
	.module('groupList')
	.component('groupList', {
		templateUrl: 'group-management/group-list/group-list.template.html',
		controller: function groupListController(Group, $location) {
			this.groups = Group.query();

			this.groupAdd = function() {
				$location.path('/groups/new');
			};

			this.sortState = {
				column: 'name',
				order: undefined
			};

			this.sort = function(sortBy) {
				if (sortBy !== 'name') {
					return;
				}
				this.sortState.order =
					this.sortState.order === 'inc' ? 'dec' : 'inc';

				this.groups.sort(function(a, b) {
					var order = this.sortState.order === 'inc' ? 1 : -1;
					return order * a.groupName.localeCompare(b.groupName);
				}.bind(this));
			};

			this.studentsFilter = function(actual, _expected) {
				var queryParts, nameParts, i, j, found,
					expected = _expected.toLowerCase();
				if (typeof actual !== 'object' || actual.students === undefined) {
					return false;
				}

				queryParts = expected.split(' ');
				return actual.students.some(function(s) {
					nameParts = ['firstName', 'lastName', 'patronymic'].map(function(field) {
						return s[field].toLowerCase();
					});

					if (nameParts.some(function(name) {
						return name.indexOf(expected) !== -1;
					})) {
						return true;
					}

					if (queryParts.length > 3) {
						return false;
					}

					for (i = 0; i < queryParts.length; ++i) {
						found = false;
						for (j = 0; j < nameParts.length; ++j) {
							if (nameParts[j].indexOf(queryParts[i]) !== -1) {
								found = true;
								nameParts.splice(j, 1);
								break;
							}
						}
						if (!found) {
							return false;
						}
					}
					return true;
				});
			};
		}
	});
