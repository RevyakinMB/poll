angular
	.module('testPassing', [])
	.config(function testPassingConfig($routeProvider) {
		$routeProvider
			.when('/test-passing/:testingId', {
				title: 'Test passing',
				template: '<test-passing></test-passing>'
			});
	});
