angular
	.module('settings', [])
	.config(function settingsConfig($routeProvider) {
		$routeProvider
			.when('/settings', {
				title: 'Settings',
				template: '<settings></settings>'
			});
	});
