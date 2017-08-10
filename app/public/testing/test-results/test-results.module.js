angular
	.module('testResults', [])
	.config(function testResultsConfig($routeProvider) {
		$routeProvider.when('/testResults/:testingId/:studentId?', {
			title: 'Test results',
			template: '<test-results></test-results>'
		});
	});
