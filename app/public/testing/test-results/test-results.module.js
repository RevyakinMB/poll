angular
	.module('testResults', [])
	.config(function testResultsConfig($routeProvider) {
		$routeProvider.when('/testResults/:testingId/:studentId?', {
			template: '<test-results></test-results>'
		});
	});
