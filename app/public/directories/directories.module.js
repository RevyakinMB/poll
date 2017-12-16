angular
	.module('directories', [])
	.config(function directoriesConfig($routeProvider) {
		$routeProvider
			.when('/directories/:directory?', {
				title: 'Directory',
				template: '<directory></directory>'
			});
	});
