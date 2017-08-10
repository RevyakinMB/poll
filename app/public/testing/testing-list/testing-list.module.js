angular
	.module('testingList', [])
	.config(function testingListConfig($routeProvider) {
		$routeProvider
			.when('/testings', {
				title: 'Testing list',
				template: '<testing-list></testing-list>'
			});
	});
