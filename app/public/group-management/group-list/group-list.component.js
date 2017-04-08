angular
	.module('groupList')
	.component('groupList', {
		templateUrl: 'group-management/group-list/group-list.template.html',
		controller: function groupListController(Group) {
			this.groups = Group.query();

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
		}
	});
