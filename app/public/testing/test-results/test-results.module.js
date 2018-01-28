angular
	.module('testResults', [])
	.config(function testResultsConfig($routeProvider) {
		$routeProvider.when('/test-results/:testingId/:studentId?', {
			title: 'Test results',
			template: '<test-results></test-results>'
		});
	});
