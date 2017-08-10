angular
	.module('backupList', [])
	.config(function backupListConfig($routeProvider) {
		$routeProvider
			.when('/backup-list/:backupId?', {
				title: 'Backup',
				template: '<backup-list></backup-list>'
			});
	});
