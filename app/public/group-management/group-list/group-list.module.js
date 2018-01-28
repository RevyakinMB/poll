angular.module('groupList', [
	'core'
]).config(function groupListConfig($routeProvider) {
	$routeProvider
		.when('/groups', {
			title: 'Groups',
			template: '<group-list></group-list>'
		})
		.when('/groups/:groupId', {
			title: 'Groups',
			template: '<group-modify></group-modify>'
		});
});
