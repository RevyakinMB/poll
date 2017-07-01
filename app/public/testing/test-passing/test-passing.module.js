angular
	.module('testPassing', [])
	.config(function testPassingConfig($routeProvider) {
		$routeProvider
			.when('/testPassing/:testingId', {
				template: '<test-passing></test-passing>'
			});
	});
