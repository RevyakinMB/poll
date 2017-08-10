angular
	.module('testPassing', [])
	.config(function testPassingConfig($routeProvider) {
		$routeProvider
			.when('/testPassing/:testingId', {
				title: 'Test passing',
				template: '<test-passing></test-passing>'
			});
	});
