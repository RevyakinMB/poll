angular
	.module('backupList', [])
	.config(function backupListConfig($routeProvider) {
		$routeProvider
			.when('/backup-list/:backupId?', {
				template: '<backup-list></backup-list>'
			});
	});
