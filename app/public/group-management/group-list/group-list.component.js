angular
	.module('groupList')
	.component('groupList', {
		templateUrl: 'group-management/group-list/group-list.template.html',
		controller: function groupListController(Group, $location, gettextCatalog, messenger) {
			this.groups = Group.query(
				function() {},
				function(err) {
					console.log(err);
				});

			this.groupAdd = function() {
				$location.path('/groups/new');
			};

			this.groupEdit = function() {
				var selected = this.groups.filter(function(g) {
					return g.checked;
				});
				if (selected.length !== 1) {
					return;
				}

				$location.path('/groups/' + selected[0]._id);
			};

			this.groupDelete = function() {
				var victims = this.groups.filter(function(g) {
					return g.checked;
				});

				victims.forEach(function(v) {
					delete v.checked;

					v.$delete({
						groupId: v._id
					},
					function() {
						var idx = this.groups.indexOf(v);
						this.groups.splice(idx, 1);
						messenger({
							message: gettextCatalog.getString('Group(s) successfully removed')
						}, this.message);

					}.bind(this),
					function(err) {
						console.log(err);
						if (err.data.error === 'A testing with specified group exists') {
							messenger({
								message: gettextCatalog.getString(
									'Error: a testing with specified group exists'),
								isError: true
							}, this.message);
							return;
						}
						messenger({
							message: gettextCatalog.getString('Error: a group was not deleted'),
							isError: true
						}, this.message);

					}.bind(this));
				}, this);
			};

			this.groupCheck = function(event, g) {
				if (g) {
					g.checked = !g.checked;
				}

				event.stopPropagation();
			};

			Object.defineProperty(this, 'allChecked', {
				get: function() {
					return this.groups.every(function(g) {
						return g.checked;
					});
				}.bind(this),
				set: function(v) {
					this.groups.forEach(function(g) {
						g.checked = v;
					});
				}.bind(this)
			});

			this.groupSelectedCount = function() {
				return this.groups.filter(function(g) {
					return g.checked;
				}).length;
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

			this.stopPropagation = function($event) {
				$event.stopPropagation();
			};

			this.message = {
				text: '',
				error: false,
				hidden: true
			};
		}
	});
