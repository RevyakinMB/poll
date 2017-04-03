angular
	.module('groupList')
	.component('groupList', {
		templateUrl: 'group-management/group-list/group-list.template.html',
		controller: function groupListController(Group) {
			this.groups = Group.query();
		}
	});
