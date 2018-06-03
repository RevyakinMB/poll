angular
	.module('testProgress', [])
	.config(function testProgressConfig($routeProvider) {
		$routeProvider.when('/test-progress/:testingId', {
			title: 'Test control',
			template: '<test-progress></test-progress>'
		});
	});
