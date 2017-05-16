angular
	.module('testingList', [])
	.config(function testingListConfig($routeProvider) {
		$routeProvider
			.when('/testings', {
				template: '<testing-list></testing-list>'
			});
	});
