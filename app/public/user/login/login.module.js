angular
	.module('login', [])
	.config(function loginConfig($routeProvider) {
		$routeProvider
			.when('/login', {
				title: 'Login',
				template: '<login></login>'
			});
	});
