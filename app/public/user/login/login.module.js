angular
	.module('login', [])
	.config(function loginConfig($routeProvider) {
		$routeProvider
			.when('/login', {
				template: '<login></login>'
			});
	});
